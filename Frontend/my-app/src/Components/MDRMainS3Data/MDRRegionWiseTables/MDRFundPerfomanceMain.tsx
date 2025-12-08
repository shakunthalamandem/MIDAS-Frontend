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

const getPerfColor = (value: string | null) => {
  if (!value) return undefined
  const numeric = Number(
    value
      .replace(/%/g, "")
      .replace(/,/g, "")
      .trim()
  )
  if (Number.isNaN(numeric)) return undefined
  if (numeric < 0) return "#d32f2f"
  return undefined
}

const displayValue = (value: string | null) => value ?? "-"

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
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: 2,
          backgroundColor: "#f7f8fb",
        }}
      >

          <Typography variant="h6" sx={{ fontWeight: 700 ,color:'#002060'}} align="center">
            Fund Performance {asOfDate ? `(as of ${asOfDate})` : ""}
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

        <TableContainer component={Box} sx={{ border: "1px solid #dcdcdc" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {HEADERS.map((header) => (
                  <TableCell
                    key={header.key}
                    align={header.align ?? "left"}
                    sx={{
                      fontWeight: 700,
                      backgroundColor: "#f5f6fa",
                      borderBottom: "1px solid #dcdcdc",
                    }}
                  >
                    {header.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.fund}>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      minWidth: 160,
                    }}
                  >
                    {row.fund}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: getPerfColor(row.dtd) }}
                  >
                    {displayValue(row.dtd)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: getPerfColor(row.mtd) }}
                  >
                    {displayValue(row.mtd)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: getPerfColor(row.ytd) }}
                  >
                    {displayValue(row.ytd)}
                  </TableCell>
                  <TableCell align="right">
                    {displayValue(row.long_exposure)}
                  </TableCell>
                  <TableCell align="right">
                    {displayValue(row.short_exposure)}
                  </TableCell>
                  <TableCell align="right">
                    {displayValue(row.aum)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  )
}

export default MDRFundPerfomanceMain
