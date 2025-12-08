// MDRCummulativeRegionChartMain.tsx
import React, { useEffect, useState } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Button,
  Container,
} from "@mui/material"
import MDRCummulativeRegionChart, {
  RegionPoint,
} from "./MDRCummulativeRegionChart"

const normalizeSeries = (payload: any): RegionPoint[] => {
  const rawSeries: any[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.series)
      ? payload.series
      : []

  return rawSeries
    .filter((item) => item?.date)
    .map((item) => ({
      date: String(item.date),
      us: Number(item.us ?? item.US ?? 0),
      nonUsAmerica: Number(
        item.nonUsAmerica ?? item.non_us_america ?? item.amerExUs ?? 0
      ),
      apac: Number(item.apac ?? item.APAC ?? 0),
      emea: Number(item.emea ?? item.EMEA ?? 0),
      all: Number(item.all ?? item.ALL ?? 0),
    }))
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )
}

const MDRCummulativeRegionChartMain: React.FC = () => {
  const [series, setSeries] = useState<RegionPoint[]>([])
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
        `${apiUrl}/api/mdr_cummulative_by_region/`,
        {
          method: "POST", // 👈 changed from GET to POST
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({}), // 👈 send an empty JSON body (adjust if API expects payload)
        }
      )

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || "Failed to load cumulative MDR data")
      }

      const data = await response.json()
      setSeries(normalizeSeries(data))
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "Unable to load MDR cumulative data")
      setSeries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
     <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
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

          <Typography variant="h6" sx={{ fontWeight: 700, color: "#002060" }} align="center">
            MDR Cumulative P&L by Region
          </Typography>


        {loading && (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box mt={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {!loading && !error && !series.length && (
          <Box mt={2}>
            <Alert severity="info">No cumulative data available.</Alert>
          </Box>
        )}

        {!loading && !error && series.length > 0 && (
          <MDRCummulativeRegionChart series={series} />
        )}
      </CardContent>
    </Card>
   </Container>
  )
}

export default MDRCummulativeRegionChartMain
