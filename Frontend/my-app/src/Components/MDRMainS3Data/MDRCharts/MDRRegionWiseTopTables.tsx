import React, { useEffect, useMemo, useState } from "react"
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material"

type RegionKey = "US" | "EMEA" | "APAC" | string

type MetricRow = {
  ticker: string
  primary: number | null
  secondary?: number | null
}

type MetricData = Record<RegionKey, MetricRow[]>

interface ApiResponseShape {
  trade_date?: string
  top_10_days_held?: Record<string, any[]>
  top10DaysHeld?: Record<string, any[]>
  top_10_pnl?: Record<string, any[]>
  top10Pnl?: Record<string, any[]>
  top_10_cumulative_pnl?: Record<string, any[]>
  top10CumulativePnl?: Record<string, any[]>
}

interface RegionTableProps {
  region: RegionKey
  columnLabel: string
  secondaryColumnLabel?: string
  rows: MetricRow[]
}

interface MetricSectionProps {
  title: string
  columnLabel: string
  secondaryColumnLabel?: string
  metricData: MetricData
}

const formatNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-"
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

const NumberCell: React.FC<{ value: number | null | undefined }> = ({
  value,
}) => {
  const num = value === null || value === undefined ? null : Number(value)
  const color =
    num === null ? "#111827" : num < 0 ? "#c0392b" : num > 0 ? "#0b9a41" : "#111827"

  return (
    <Box component="span" sx={{ color }}>
      {formatNumber(num)}
    </Box>
  )
}

const normalizeDaysHeldOver30 = (
  payload?: Record<string, any[]>
): MetricData => {
  if (!payload || typeof payload !== "object") return {}

  return Object.entries(payload).reduce<MetricData>((acc, [region, rows]) => {
    const filtered = Array.isArray(rows)
      ? rows.filter((row) => Number(row?.days_held) > 30)
      : []

    acc[region] = filtered.slice(0, 10).map((row: any, idx: number) => ({
      ticker: row?.ticker ?? `row-${idx}`,
      primary:
        row?.days_held !== undefined && row?.days_held !== null
          ? Number(row.days_held)
          : null,
      secondary:
        row?.pnl !== undefined && row?.pnl !== null ? Number(row.pnl) : null,
    }))
    return acc
  }, {})
}

const normalizePnl = (
  payload?: Record<string, any[]>,
  primaryKey = "pnl",
  secondaryKey?: string
): MetricData => {
  if (!payload || typeof payload !== "object") return {}

  return Object.entries(payload).reduce<MetricData>((acc, [region, rows]) => {
    acc[region] = (Array.isArray(rows) ? rows.slice(0, 10) : []).map(
      (row: any, idx: number) => ({
        ticker: row?.ticker ?? `row-${idx}`,
        primary:
          row?.[primaryKey] !== undefined && row?.[primaryKey] !== null
            ? Number(row[primaryKey])
            : null,
        secondary:
          secondaryKey &&
          row?.[secondaryKey] !== undefined &&
          row?.[secondaryKey] !== null
            ? Number(row[secondaryKey])
            : secondaryKey
              ? null
              : undefined,
      })
    )
    return acc
  }, {})
}

const RegionTable: React.FC<RegionTableProps> = ({
  region,
  columnLabel,
  secondaryColumnLabel,
  rows,
}) => (
  <Grid item xs={12} sm={4}>
    <Paper
      elevation={1}
      sx={{
        p: 2,
        borderRadius: 2,
        height: "100%",
        boxSizing: "border-box",
        border: "1px solid #dce3f0",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          mb: 1,
          textAlign: "center",
          fontWeight: 700,
          color: "#1b2a52",
          letterSpacing: 0.2,
        }}
      >
        {region}
      </Typography>
      <TableContainer>
        <Table size="small" sx={{ borderCollapse: "separate", borderSpacing: 0 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: "#eef2fb",
                  color: "#1b2a52",
                  fontWeight: 700,
                  borderRight: "1px solid #dce3f0",
                }}
              >
                Ticker
              </TableCell>
              <TableCell
                align="right"
                sx={{ backgroundColor: "#eef2fb", color: "#1b2a52", fontWeight: 700 }}
              >
                {columnLabel}
              </TableCell>
              {secondaryColumnLabel && (
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: "#eef2fb",
                    color: "#1b2a52",
                    fontWeight: 700,
                    borderLeft: "1px solid #dce3f0",
                  }}
                >
                  {secondaryColumnLabel}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow
                key={`${region}-${row.ticker}-${idx}`}
                sx={{
                  "&:nth-of-type(odd)": { backgroundColor: "#fafbff" },
                  "&:hover": { backgroundColor: "#f3f6ff" },
                }}
              >
                <TableCell>{row.ticker}</TableCell>
                <TableCell align="right">
                  <NumberCell value={row.primary} />
                </TableCell>
                {secondaryColumnLabel && (
                  <TableCell align="right">
                    <NumberCell value={row.secondary} />
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

const MDRRegionWiseTopTables: React.FC = () => {
  const [tradeDate, setTradeDate] = useState<string>("")
  const [daysHeld, setDaysHeld] = useState<MetricData>({})
  const [topPnl, setTopPnl] = useState<MetricData>({})
  const [topCumulativePnl, setTopCumulativePnl] = useState<MetricData>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.REACT_APP_API_URL ?? ""
  const getToken = () => localStorage.getItem("access_token") || ""

  const fetchData = async () => {
    if (!apiUrl) {
      setError("API URL is not defined in environment variables")
      return
    }

    try {
      setLoading(true)
      setError(null)

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

      const rawDaysHeld = body.top_10_days_held || body.top10DaysHeld
      const rawPnl = body.top_10_pnl || body.top10Pnl
      const rawCumulative = body.top_10_cumulative_pnl || body.top10CumulativePnl

      setDaysHeld(normalizeDaysHeldOver30(rawDaysHeld))
      setTopPnl(normalizePnl(rawPnl, "pnl", "cumulative_pnl"))
      setTopCumulativePnl(
        normalizePnl(rawCumulative, "dtd_pnl", "cumulative_pnl")
      )
      setTradeDate(body.trade_date || "")
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "Unable to load data")
      setTradeDate("")
      setDaysHeld({})
      setTopPnl({})
      setTopCumulativePnl({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sections = useMemo(
    () => [
      {
        key: "days_held",
        title: "Days Held > 30",
        columnLabel: "Days Held",
        secondaryColumnLabel: "P&L",
        metricData: daysHeld,
      },
      {
        key: "top_pnl",
        title: "Top 10 DTD P&L",
        columnLabel: "DTD P&L",
        secondaryColumnLabel: "Cumulative P&L",
        metricData: topPnl,
      },
      {
        key: "top_cumulative",
        title: "Top 10 Gainers (Cumulative P&L)",
        columnLabel: "DTD P&L",
        secondaryColumnLabel: "Cumulative P&L",
        metricData: topCumulativePnl,
      },
    ],
    [daysHeld, topCumulativePnl, topPnl]
  )

  return (
    <Card
      elevation={2}
      sx={{
        bgcolor: "#f7f8fb",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          gap={0.5}
          mb={2}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1b2a52" }}>
            Region Wise Top Tables
          </Typography>
          {tradeDate ? (
            <Typography variant="body2" sx={{ color: "#4b5563" }}>
              Trade Date: {tradeDate}
            </Typography>
          ) : null}
        </Stack>

        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading &&
          !error &&
          sections.map((section) => (
            <Box key={section.key} sx={{ mb: 3 }}>
              <MetricSection
                title={section.title}
                columnLabel={section.columnLabel}
                secondaryColumnLabel={section.secondaryColumnLabel}
                metricData={section.metricData}
              />
            </Box>
          ))}
      </CardContent>
    </Card>
  )
}

export default MDRRegionWiseTopTables
