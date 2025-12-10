import React, { useEffect, useMemo, useState } from "react"
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"

type FundPerformanceRow = {
  fund: string
  dtd: string | null
  mtd: string | null
  ytd: string | null
  long_exposure: string | null
  short_exposure: string | null
  aum: string | null
}

type ApiResponse = {
  as_of_date?: string
  funds?: FundPerformanceRow[]
}

const HEADERS: { key: keyof FundPerformanceRow; label: string; align?: "right" }[] =
  [
    { key: "fund", label: "Fund" },
    { key: "dtd", label: "DTD", align: "right" },
    { key: "mtd", label: "MTD", align: "right" },
    { key: "ytd", label: "YTD", align: "right" },
    { key: "long_exposure", label: "Long Exposure", align: "right" },
    { key: "short_exposure", label: "Short Exposure", align: "right" },
    { key: "aum", label: "AUM", align: "right" },
  ]

const toNumeric = (value: string | null) => {
  if (!value) return NaN
  const cleaned = value
    .replace(/[%,$]/g, "")
    .replace(/,/g, "")
    .replace(/m/gi, "")
    .replace(/b/gi, "")
    .replace(/_/g, "")
    .trim()

  const num = Number(cleaned)
  if (Number.isNaN(num)) return NaN

  // If the original string had "b" or "B", assume billions
  if (/[bB]/.test(value)) return num * 1_000
  // If it had "m" assume millions
  if (/[mM]/.test(value)) return num

  return num
}

const getPerfColor = (value: string | null) => {
  if (!value) return undefined
  const numeric = toNumeric(value)
  if (Number.isNaN(numeric)) return undefined
  if (numeric > 0) return "#1a7f37" // green
  if (numeric < 0) return "#c62828" // red
  return "#111827"
}

const formatDisplayValue = (value: string | null) => {
  if (!value) return "-"
  const trimmed = value.trim()
  // Normalize suffixes like "m"/"b" to uppercase for consistency (e.g., 14m -> 14M)
  return trimmed.replace(/([mb])\b/gi, (match) => match.toUpperCase())
}

const MDRFundPerfomanceMain: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL ?? ""
  const token = localStorage.getItem("access_token") || ""

  const [rows, setRows] = useState<FundPerformanceRow[]>([])
  const [asOfDate, setAsOfDate] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!apiUrl) {
      setError("API URL is not defined")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `${apiUrl}/api/mdr_fund_wise_performance_table/`,
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
        throw new Error(message || "Failed to load fund performance data")
      }

      const data: ApiResponse = await response.json()
      setRows(data.funds ?? [])
      setAsOfDate(data.as_of_date ?? "")
    } catch (err: any) {
      setError(err?.message || "Unable to load fund performance data")
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasData = useMemo(() => rows && rows.length > 0, [rows])

  return (
    <Container maxWidth="xl" sx={{ mb: 4, mt: 4 }}>
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e5e7eb",
          borderRadius: 2,
          p: 2.5,
          backgroundColor: "#fff",
        }}
      >

          <Typography variant="h6" sx={{ fontWeight: 700, color: "#c00000",mb:'2' }} align="center">
            {/* Fund Performance {asOfDate ? `(as of ${asOfDate})` : ""} */}
            Fund Wise Performance 
          </Typography>
          {loading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                Loading...
              </Typography>
            </Stack>
          )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && !hasData && (
          <Alert severity="info">No fund performance data available.</Alert>
        )}

        <TableContainer
          component={Box}
          sx={{
            border: "1px solid #e5e7eb",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                {HEADERS.map((header) => (
                  <TableCell
                    key={header.key}
                    align={header.align ?? "left"}
                    sx={{
                      fontWeight: 700,
                      backgroundColor: "#eef0ff",
                      color: "#1f2e78",
                      borderBottom: "1px solid #d0d7e2",
                      fontSize: 13,
                    }}
                  >
                    {header.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const isTotal = row.fund?.toLowerCase?.() === "total"
                return (
                  <TableRow
                    key={row.fund}
                    sx={{
                      "&:not(:last-of-type) td": { borderBottom: "1px solid #e5e7eb" },
                      backgroundColor: isTotal ? "#f7f8ff" : "inherit",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: isTotal ? 700 : 600,
                        minWidth: 180,
                        color: isTotal ? "#111827" : "#1f2937",
                      }}
                    >
                      {row.fund}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: getPerfColor(row.dtd),
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: isTotal ? 700 : 500,
                      }}
                    >
                      {formatDisplayValue(row.dtd)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: getPerfColor(row.mtd),
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: isTotal ? 700 : 500,
                      }}
                    >
                      {formatDisplayValue(row.mtd)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: getPerfColor(row.ytd),
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: isTotal ? 700 : 500,
                      }}
                    >
                      {formatDisplayValue(row.ytd)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: getPerfColor(row.long_exposure),
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: isTotal ? 700 : 500,
                      }}
                    >
                      {formatDisplayValue(row.long_exposure)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: getPerfColor(row.short_exposure),
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: isTotal ? 700 : 500,
                      }}
                    >
                      {formatDisplayValue(row.short_exposure)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: getPerfColor(row.aum),
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: isTotal ? 700 : 500,
                      }}
                    >
                      {formatDisplayValue(row.aum)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  )
}

export default MDRFundPerfomanceMain
