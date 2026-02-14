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
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'
import { useHistoryStore } from '@/stores/history.store'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

const { t } = useI18n()
const historyStore = useHistoryStore()

type ViewMode = 'hourly' | 'daily'
const viewMode = ref<ViewMode>('hourly')

function toggleView(): void {
  viewMode.value = viewMode.value === 'hourly' ? 'daily' : 'hourly'
}

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
