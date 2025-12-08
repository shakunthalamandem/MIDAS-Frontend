import React, { useEffect, useMemo, useState } from "react"
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  Alert,
  Stack,
  Button,
} from "@mui/material"

/* ------------------------------------------------------
   TYPES
-------------------------------------------------------*/
type RegionKey = "US" | "EMEA" | "APAC" | string

type RegionMetricMap = Record<string, any[]>

interface RegionRowDisplay {
  ticker: string
  value: number | null
  secondaryValue?: number | null
}

type MetricData = Record<RegionKey, RegionRowDisplay[]>

interface RegionTableProps {
  region: RegionKey
  columnLabel: string
  secondaryColumnLabel?: string
  rows: RegionRowDisplay[]
}

interface MetricSectionProps {
  title: string
  columnLabel: string
  secondaryColumnLabel?: string
  metricData: Partial<MetricData>
}

interface ApiResponseShape {
  trade_date?: string
  top_10_days_held?: RegionMetricMap
  top_10_dtd_pnl?: RegionMetricMap
  top_10_gainers?: RegionMetricMap
  top_10_current_price?: RegionMetricMap
  top_10_pnl?: RegionMetricMap
  top_10_cumulative_pnl?: RegionMetricMap
  // fallback camelCase variants if backend changes casing
  top10DaysHeld?: RegionMetricMap
  top10DtdPnl?: RegionMetricMap
  top10Gainers?: RegionMetricMap
  top10CurrentPrice?: RegionMetricMap
  top10Pnl?: RegionMetricMap
  top10CumulativePnl?: RegionMetricMap
}

type MetricConfigKey =
  | "top_10_days_held"
  | "top_10_dtd_pnl"
  | "top_10_gainers"
  | "top_10_current_price"
  | "top_10_pnl"
  | "top_10_cumulative_pnl"
  | "top10DaysHeld"
  | "top10DtdPnl"
  | "top10Gainers"
  | "top10CurrentPrice"
  | "top10Pnl"
  | "top10CumulativePnl"

interface MetricConfig {
  key: MetricConfigKey
  title: string
  columnLabel: string
  valueKey: string
  secondaryColumnLabel?: string
  secondaryValueKey?: string
}

const METRICS: MetricConfig[] = [
  {
    key: "top_10_days_held",
    title: "Top 10 Days Held",
    columnLabel: "Days Held",
    valueKey: "days_held",
  },
  {
    key: "top_10_dtd_pnl",
    title: "Top 10 DTD P&L",
    columnLabel: "DTD P&L",
    valueKey: "pnl",
  },
  {
    key: "top_10_pnl",
    title: "Top 10 P&L",
    columnLabel: "DTD P&L",
    valueKey: "pnl",
    secondaryColumnLabel: "Cumulative P&L",
    secondaryValueKey: "cumulative_pnl",
  },
  {
    key: "top_10_cumulative_pnl",
    title: "Top 10 Cumulative P&L",
    columnLabel: "DTD P&L",
    valueKey: "dtd_pnl",
    secondaryColumnLabel: "Cumulative P&L",
    secondaryValueKey: "cumulative_pnl",
  },
  {
    key: "top_10_gainers",
    title: "Top 10 Gainers",
    columnLabel: "Gain",
    valueKey: "gain",
  },
  {
    key: "top_10_current_price",
    title: "Top 10 Current Price",
    columnLabel: "Current Price",
    valueKey: "current_price",
  },
]

const formatNumber = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return "-"
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

const normalizeMetric = (
  metricMap: RegionMetricMap | undefined,
  valueKey: string,
  secondaryValueKey?: string
): MetricData => {
  if (!metricMap || typeof metricMap !== "object") return {}

  return Object.entries(metricMap).reduce<MetricData>((acc, [region, rows]) => {
    const normalizedRows: RegionRowDisplay[] = Array.isArray(rows)
      ? rows.slice(0, 10).map((row: any, idx: number) => ({
          ticker: row?.ticker ?? `row-${idx}`,
          value:
            row?.[valueKey] !== undefined && row?.[valueKey] !== null
              ? Number(row[valueKey])
              : null,
          secondaryValue:
            secondaryValueKey &&
            row?.[secondaryValueKey] !== undefined &&
            row?.[secondaryValueKey] !== null
              ? Number(row[secondaryValueKey])
              : secondaryValueKey
                ? null
                : undefined,
        }))
      : []

    acc[region] = normalizedRows
    return acc
  }, {})
}

const safeMetricData = (
  data: ApiResponseShape,
  config: MetricConfig
): MetricData => {
  // Prefer snake_case keys, but fall back to camelCase variants if provided
  const primary = data[config.key as keyof ApiResponseShape] as RegionMetricMap
  const fallbackKey = (config.key
    .replace(/^top_10_/, "top10")
    .replace(/_([a-z])/g, (_, c) => c.toUpperCase()) || config.key) as MetricConfigKey
  const fallback = data[fallbackKey as keyof ApiResponseShape] as RegionMetricMap

  return normalizeMetric(
    primary ?? fallback,
    config.valueKey,
    config.secondaryValueKey
  )
}

/* ------------------------------------------------------
   REGION TABLE
-------------------------------------------------------*/
const RegionTable: React.FC<RegionTableProps> = ({
  region,
  columnLabel,
  secondaryColumnLabel,
  rows,
}) => {
  const top10: RegionRowDisplay[] = rows?.slice(0, 10) || []

  return (
    <Grid item xs={12} sm={4}>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 2,
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {region}
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ticker</TableCell>
                <TableCell align="right">{columnLabel}</TableCell>
                {secondaryColumnLabel && (
                  <TableCell align="right">{secondaryColumnLabel}</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {top10.map((row, idx) => (
                <TableRow key={`${region}-${row.ticker}-${idx}`}>
                  <TableCell>{row.ticker}</TableCell>
                  <TableCell align="right">{formatNumber(row.value)}</TableCell>
                  {secondaryColumnLabel && (
                    <TableCell align="right">
                      {formatNumber(row.secondaryValue ?? null)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Grid>
  )
}

/* ------------------------------------------------------
   METRIC SECTION
-------------------------------------------------------*/
const MetricSection: React.FC<MetricSectionProps> = ({
  title,
  columnLabel,
  secondaryColumnLabel,
  metricData,
}) => {
  const regions: RegionKey[] = ["US", "EMEA", "APAC"]

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "white",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>

      <Grid container spacing={2}>
        {regions.map((region) => (
          <RegionTable
            key={region}
            region={region}
            columnLabel={columnLabel}
            secondaryColumnLabel={secondaryColumnLabel}
            rows={metricData[region] || []}
          />
        ))}
      </Grid>
    </Paper>
  )
}

/* ------------------------------------------------------
   MAIN COMPONENT
-------------------------------------------------------*/
const RegionWiseMDRTables: React.FC = () => {
  const [data, setData] = useState<ApiResponseShape | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.REACT_APP_API_URL ?? ""
  const getToken = () => localStorage.getItem("access_token") || ""

  const fetchTables = async () => {
    if (!apiUrl) {
      setError("API URL is not defined in environment variables")
      return
    }

    try {
      setError(null)
      setLoading(true)

      const token = getToken()
      const response = await fetch(
        `${apiUrl}/api/mdr_top_performance_table/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({}),
        }
      )

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || "Failed to fetch top performance tables")
      }

      const body = (await response.json()) as ApiResponseShape
      setData(body)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "Unable to load top performance tables")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sections = useMemo(() => {
    if (!data) return []
    return METRICS.map((metric) => ({
      ...metric,
      metricData: safeMetricData(data, metric),
    }))
  }, [data])

  const tradeDateLabel =
    data?.trade_date ||
    data?.["tradeDate" as keyof ApiResponseShape]?.toString() ||
    ""

  return (
    <Container
      maxWidth={false}
      sx={{ p: 3, backgroundColor: "#f5f6fa", minHeight: "100vh" }}
    >
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              gap={1.5}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Top Performance Tables {tradeDateLabel ? `(${tradeDateLabel})` : ""}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={fetchTables}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Stack>
            </Stack>
          </Grid>

          {loading && (
            <Grid item xs={12}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                py={4}
              >
                <CircularProgress />
              </Box>
            </Grid>
          )}

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          {!loading && !error && sections.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="info">No top performance data available.</Alert>
            </Grid>
          )}

          {!loading &&
            !error &&
            sections.map((section) => (
              <Grid item xs={12} key={section.key}>
                <MetricSection
                  title={section.title}
                  columnLabel={section.columnLabel}
                  secondaryColumnLabel={section.secondaryColumnLabel}
                  metricData={section.metricData}
                />
              </Grid>
            ))}
        </Grid>
      </Box>
    </Container>
  )
}

export default RegionWiseMDRTables
