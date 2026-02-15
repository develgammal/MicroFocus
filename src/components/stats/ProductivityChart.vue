<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  type Plugin,
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'
import { useHistoryStore } from '@/stores/history.store'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

const { t } = useI18n()
const historyStore = useHistoryStore()

type ViewMode = 'hourly' | 'daily'
const viewMode = ref<ViewMode>('hourly')

interface Segment {
  startIndex: number
  endIndex: number
  scores: number[]
  avgScore: number
  duration: number // in minutes (assuming each data point = focus interval)
}

// Helper function to format duration
function formatDuration(minutes: number): string {
  const roundedMinutes = Math.round(minutes)

  if (roundedMinutes < 60) {
    return `${roundedMinutes} min${roundedMinutes !== 1 ? 's' : ''}`
  }

  const hours = Math.floor(roundedMinutes / 60)
  const mins = roundedMinutes % 60

  if (mins === 0) return `${hours}:00 hr${hours !== 1 ? 's' : ''}`

  return `${hours}:${mins.toString().padStart(2, '0')} hrs`
}

// Custom plugin to draw segment labels
const segmentLabelPlugin: Plugin<'line'> = {
  id: 'segmentLabels',
  afterDatasetsDraw(chart) {
    const ctx = chart.ctx
    const dataset = chart.data.datasets[0]
    const meta = chart.getDatasetMeta(0)

    if (!dataset || !meta || !meta.data.length) return

    // Only show labels in hourly view
    const isHourly = viewMode.value === 'hourly'
    if (!isHourly) return

    // Identify segments (continuous non-zero values separated by zeros/breaks)
    const segments: Segment[] = []
    let currentSegment: Segment | null = null

    const dataValues = dataset.data as number[]
    const sessionDurations = historyStore.sessions.map(s => s.duration)

    for (let index = 0; index < dataValues.length; index++) {
      const value = dataValues[index]

      if (typeof value !== 'number') continue

      if (value > 0) {
        if (!currentSegment) {
          currentSegment = {
            startIndex: index,
            endIndex: index,
            scores: [value],
            avgScore: value,
            duration: sessionDurations[index] || 0,
          }
        } else {
          currentSegment.endIndex = index
          currentSegment.scores.push(value)
          currentSegment.duration += sessionDurations[index] || 0
        }
      } else {
        // Break encountered - close current segment if exists
        if (currentSegment !== null) {
          currentSegment.avgScore =
            currentSegment.scores.reduce((sum: number, s: number) => sum + s, 0) / currentSegment.scores.length
          segments.push(currentSegment)
          currentSegment = null
        }
      }
    }

    // Add last segment if exists (no break after it)
    if (currentSegment !== null && currentSegment.scores.length > 1) {
      currentSegment.avgScore =
        currentSegment.scores.reduce((sum: number, s: number) => sum + s, 0) / currentSegment.scores.length
      segments.push(currentSegment)
    }

    // Get color from CSS variables
    const isDark = document.documentElement.classList.contains('dark')
    const labelColor = isDark ? '#94a3b8' : '#64748b'

    // Draw labels for each segment
    segments.forEach(segment => {
      // Skip if segment is too short (single point)
      if (segment.startIndex === segment.endIndex) return

      // Calculate middle point of segment
      const midIndex = Math.floor((segment.startIndex + segment.endIndex) / 2)
      const midPoint = meta.data[midIndex]

      if (!midPoint) return

      const x = midPoint.x

      // Determine if label should be above or below based on average score
      const isAbove = segment.avgScore <= 5
      const offsetY = isAbove ? -20 : 20

      // Calculate y position with safe distance from curve
      // Find the score at the middle point for positioning
      const midScore = dataValues[midIndex] || segment.avgScore
      const yScale = chart.scales.y

      if (!yScale) return

      let baseY = yScale.getPixelForValue(midScore)

      // Add extra offset if the curve is near the edges
      if (isAbove) {
        // Check if we're too close to the top
        const topEdge = chart.chartArea.top
        if (baseY + offsetY - 15 < topEdge) {
          // Place below instead
          baseY = yScale.getPixelForValue(midScore)
          const y = baseY + 20
          drawLabel(ctx, x, y, segment, labelColor, false)
        } else {
          const y = baseY + offsetY
          drawLabel(ctx, x, y, segment, labelColor, true)
        }
      } else {
        // Check if we're too close to the bottom
        const bottomEdge = chart.chartArea.bottom
        if (baseY + offsetY + 15 > bottomEdge) {
          // Place above instead
          baseY = yScale.getPixelForValue(midScore)
          const y = baseY - 20
          drawLabel(ctx, x, y, segment, labelColor, true)
        } else {
          const y = baseY + offsetY
          drawLabel(ctx, x, y, segment, labelColor, false)
        }
      }
    })
  }
}

// Helper function to draw a label
function drawLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  segment: Segment,
  color: string,
  isAbove: boolean
): void {
  const durationStr = formatDuration(segment.duration)
  const scoreStr = segment.avgScore.toFixed(1)
  const text = `${durationStr}, ${scoreStr}/10`

  ctx.save()
  ctx.font = '10px Inter, sans-serif'
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = isAbove ? 'bottom' : 'top'

  // Add subtle background for readability
  const metrics = ctx.measureText(text)
  const padding = 3
  const bgX = x - metrics.width / 2 - padding
  const bgY = isAbove ? y - 12 - padding : y - padding
  const bgWidth = metrics.width + padding * 2
  const bgHeight = 12 + padding * 2

  // Semi-transparent background
  ctx.fillStyle = document.documentElement.classList.contains('dark')
    ? 'rgba(15, 23, 42, 0.7)'
    : 'rgba(248, 250, 252, 0.7)'
  ctx.fillRect(bgX, bgY, bgWidth, bgHeight)

  // Draw text
  ctx.fillStyle = color
  ctx.fillText(text, x, y)

  ctx.restore()
}

function toggleView(): void {
  viewMode.value = viewMode.value === 'hourly' ? 'daily' : 'hourly'
}

// Register the custom plugin
ChartJS.register(segmentLabelPlugin)

const chartData = computed<ChartData<'line'>>(() => {
  const data = viewMode.value === 'hourly' ? historyStore.chartData : historyStore.dailyChartData

  return {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: viewMode.value === 'hourly' ? t('chart.focus') : t('chart.viewDaily'),
        data: data.map((d) => d.value),
        borderColor: '#059669',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        segment: viewMode.value === 'hourly' ? {
          borderColor: (ctx) => {
            const p0 = ctx.p0.parsed.y
            const p1 = ctx.p1.parsed.y
            return p0 === 0 || p1 === 0 ? '#94a3b8' : '#059669'
          },
          borderDash: (ctx) => {
            const p0 = ctx.p0.parsed.y
            const p1 = ctx.p1.parsed.y
            return p0 === 0 || p1 === 0 ? [5, 5] : undefined
          },
        } : undefined,
        pointBackgroundColor: (ctx) => {
          const value = ctx.dataset.data[ctx.dataIndex]
          return viewMode.value === 'hourly' && value === 0 ? '#94a3b8' : '#059669'
        },
        pointRadius: 3,
      },
    ],
  }
})

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      max: 10,
      grid: { display: false },
      ticks: {
        callback: (val) =>
          viewMode.value === 'hourly' && val === 0 ? t('chart.break') : val,
        color: '#059669',
      },
    },
    x: {
      grid: { display: false },
      ticks: {
        maxTicksLimit: 10,
        color: '#059669',
      },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) =>
          viewMode.value === 'hourly' && context.raw === 0
            ? t('rating.breakLabel')
            : t('chart.productivity', { score: context.raw }),
      },
    },
  },
  animation: { duration: 0 },
}))
</script>

<template>
  <div class="mt-6 md:mt-8 border-t border-border pt-4 md:pt-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-subheading text-text-muted">
        {{ t('chart.productivityTrend') }}
      </h3>
      <div class="flex gap-1 bg-surface border border-border rounded-lg p-1">
        <button
          :class="[
            'px-3 py-1 rounded text-caption font-medium transition-colors cursor-pointer',
            viewMode === 'hourly'
              ? 'bg-primary text-white'
              : 'text-text-muted hover:text-text hover:bg-border/30',
          ]"
          @click="toggleView"
          :aria-label="t('chart.toggleView')"
        >
          {{ t('chart.viewHourly') }}
        </button>
        <button
          :class="[
            'px-3 py-1 rounded text-caption font-medium transition-colors cursor-pointer',
            viewMode === 'daily'
              ? 'bg-primary text-white'
              : 'text-text-muted hover:text-text hover:bg-border/30',
          ]"
          @click="toggleView"
          :aria-label="t('chart.toggleView')"
        >
          {{ t('chart.viewDaily') }}
        </button>
      </div>
    </div>

    <div class="relative h-48 w-full">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <div v-if="viewMode === 'hourly'" class="flex justify-center mt-2 gap-4 text-caption text-text-muted">
      <div class="flex items-center">
        <span class="w-2 h-2 rounded-full" style="background-color: #059669" />
        {{ t('chart.focus') }}
      </div>
      <div class="flex items-center">
        <span class="w-2 h-2 rounded-full" style="background-color: #94a3b8" />
        {{ t('chart.break') }}
      </div>
    </div>
  </div>
</template>
