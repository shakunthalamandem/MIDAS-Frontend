import React, { useEffect, useMemo, useState } from "react"
import {
  Alert,
  Box,
  Button,
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

interface DaysHeldRow {
  ticker: string
  daysHeld: number | null
  pnl: number | null
}

type DaysHeldData = Record<RegionKey, DaysHeldRow[]>

interface ApiResponseShape {
  trade_date?: string
  top_10_days_held?: Record<string, any[]>
  top10DaysHeld?: Record<string, any[]>
}

const formatNumber = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return "-"
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

const normalizeDaysHeld = (payload?: Record<string, any[]>): DaysHeldData => {
  if (!payload || typeof payload !== "object") return {}

  return Object.entries(payload).reduce<DaysHeldData>((acc, [region, rows]) => {
    acc[region] = Array.isArray(rows)
      ? rows.slice(0, 10).map((row: any, idx: number) => ({
          ticker: row?.ticker ?? `row-${idx}`,
          daysHeld:
            row?.days_held !== undefined && row?.days_held !== null
              ? Number(row.days_held)
              : null,
          pnl:
            row?.pnl !== undefined && row?.pnl !== null
              ? Number(row.pnl)
              : null,
        }))
      : []
    return acc
  }, {})
}

const RegionTable: React.FC<{
  region: RegionKey
  rows: DaysHeldRow[]
}> = ({ region, rows }) => {
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
                <TableCell align="right">Days Held</TableCell>
                <TableCell align="right">P&L</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={`${region}-${row.ticker}-${idx}`}>
                  <TableCell>{row.ticker}</TableCell>
                  <TableCell align="right">{formatNumber(row.daysHeld)}</TableCell>
                  <TableCell align="right">{formatNumber(row.pnl)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Grid>
  )
}

const MDRRegionWiseDaysHeldTable: React.FC = () => {
  const [data, setData] = useState<DaysHeldData>({})
  const [tradeDate, setTradeDate] = useState<string>("")
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
        throw new Error(message || "Failed to fetch days-held data")
      }

      const body = (await response.json()) as ApiResponseShape
      const topDaysHeld = body.top_10_days_held || body.top10DaysHeld
      setData(normalizeDaysHeld(topDaysHeld))
      setTradeDate(body.trade_date || "")
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "Unable to load days-held data")
      setData({})
      setTradeDate("")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const regions = useMemo(() => ["US", "EMEA", "APAC"], [])

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
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          gap={1.5}
          mb={2}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Top 10 Days Held {tradeDate ? `(${tradeDate})` : ""}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
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

        {!loading && !error && !Object.keys(data).length && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No days-held data available.
          </Alert>
        )}

        {!loading && !error && Object.keys(data).length > 0 && (
          <Grid container spacing={2}>
            {regions.map((region) => (
              <RegionTable
                key={region}
                region={region}
                rows={data[region] || []}
              />
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  )
}

export default MDRRegionWiseDaysHeldTable
