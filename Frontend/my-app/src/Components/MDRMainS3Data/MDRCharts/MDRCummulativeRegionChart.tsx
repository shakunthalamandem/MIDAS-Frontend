// MDRCummulativeRegionChart.tsx
import React, { useMemo } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
  TooltipItem,
} from "chart.js"
import "chartjs-adapter-date-fns"
import { Box } from "@mui/material"

ChartJS.register(
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
)

export type RegionKey = "us" | "nonUsAmerica" | "apac" | "emea" | "all"

export type RegionPoint = {
  date: string
  us: number
  nonUsAmerica: number
  apac: number
  emea: number
  all: number
}

const REGION_META: Record<
  RegionKey,
  { label: string; color: string; dashed?: boolean }
> = {
  us: { label: "US", color: "#8B4513" },
  nonUsAmerica: { label: "AmerExUS", color: "#D2691E", dashed: true },
  apac: { label: "APAC", color: "#8DB600" },
  emea: { label: "EMEA", color: "#1E5AA8" },
  all: { label: "ALL", color: "#111111" },
}

const formatCurrency = (value: number) => {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toLocaleString()}`
}

type Props = {
  series: RegionPoint[]
}

const MDRCummulativeRegionChart: React.FC<Props> = ({ series }) => {
  const chartData = useMemo<ChartData<"line">>(() => {
    const labels = series.map((point) => point.date)

    return {
      labels,
      datasets: (Object.keys(REGION_META) as RegionKey[]).map((key) => {
        const meta = REGION_META[key]
        return {
          label: meta.label,
          data: series.map((point) => point[key]),
          borderColor: meta.color,
          backgroundColor: meta.color,
          borderWidth: 2.25,
          tension: 0.18,
          pointRadius: 0,
          spanGaps: true,
          fill: false,
          borderDash: meta.dashed ? [6, 6] : undefined,
        }
      }),
    }
  }, [series])

  const chartOptions: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index", // <- now strongly typed
        intersect: false,
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: { usePointStyle: true, padding: 12 },
        },
        tooltip: {
          intersect: false,
          mode: "index",
          callbacks: {
            label: (item: TooltipItem<"line">) => {
              const label = item.dataset.label || ""
              const value = item.parsed.y
              return `${label}: ${formatCurrency(value ?? 0)}`
            },
            title: (items: TooltipItem<"line">[]) =>
              `Date: ${items?.[0]?.label ?? ""}`,
          },
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            parser: "yyyy-MM-dd",
            tooltipFormat: "MM/dd/yyyy",
            unit: "month",
            displayFormats: {
              month: "MM/dd/yyyy",
            },
          },
          grid: { color: "rgba(0,0,0,0.08)" },
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            color: "#4A4A4A",
            autoSkip: true,
          },
          border: { color: "rgba(0,0,0,0.3)" },
        },
        y: {
          title: { display: true, text: "$P&L" },
          ticks: {
            callback: (value) => formatCurrency(Number(value)),
            color: "#4A4A4A",
          },
          grid: { color: "rgba(0,0,0,0.08)" },
          border: { color: "rgba(0,0,0,0.3)" },
        },
      },
    }),
    []
  )

  return (
    <Box sx={{ height: 520, mt: 2 }}>
      <Line data={chartData} options={chartOptions} />
    </Box>
  )
}

export default MDRCummulativeRegionChart
