<script setup lang="ts">
import { computed } from 'vue'
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

const chartData = computed<ChartData<'line'>>(() => {
  const data = historyStore.chartData
  return {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: t('chart.focus'),
        data: data.map((d) => d.value),
        borderColor: 'var(--color-chart-line)',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        segment: {
          borderColor: (ctx) => {
            const p0 = ctx.p0.parsed.y
            const p1 = ctx.p1.parsed.y
            return p0 === 0 || p1 === 0 ? 'var(--color-chart-break)' : 'var(--color-chart-line)'
          },
          borderDash: (ctx) => {
            const p0 = ctx.p0.parsed.y
            const p1 = ctx.p1.parsed.y
            return p0 === 0 || p1 === 0 ? [5, 5] : undefined
          },
        },
        pointBackgroundColor: (ctx) => {
          const value = ctx.dataset.data[ctx.dataIndex]
          return value === 0 ? 'var(--color-chart-break)' : 'var(--color-chart-line)'
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
        callback: (val) => (val === 0 ? t('chart.break') : val),
        color: 'var(--color-text-muted)',
      },
    },
    x: {
      grid: { display: false },
      ticks: {
        maxTicksLimit: 10,
        color: 'var(--color-text-muted)',
      },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) =>
          context.raw === 0
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
    <h3 class="text-subheading text-text-muted mb-4">
      {{ t('chart.productivityTrend') }}
    </h3>

    <div class="relative h-48 w-full">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <div class="flex justify-center mt-2 gap-4 text-caption text-text-muted">
      <div class="flex items-center">
        <span class="w-2 h-2 rounded-full bg-primary mr-1" />
        {{ t('chart.focus') }}
      </div>
      <div class="flex items-center">
        <span class="w-2 h-2 rounded-full bg-border-strong mr-1" />
        {{ t('chart.break') }}
      </div>
    </div>
  </div>
</template>
