import React from "react"
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
} from "@mui/material"

/* ------------------------------------------------------
   TYPES
-------------------------------------------------------*/
type RegionKey = "US" | "EMEA" | "APAC"

interface RegionRow {
  ticker: string
  value: number
}

type MetricData = Record<RegionKey, RegionRow[]>

interface ApiResponseShape {
  topDaysHeld: MetricData
  topDtdPnL: MetricData
  topGainers: MetricData
  currentPrice: MetricData
}

interface RegionTableProps {
  region: RegionKey
  columnLabel: string
  rows: RegionRow[]
}

interface MetricSectionProps {
  title: string
  columnLabel: string
  metricData: Partial<MetricData>
}

/* ------------------------------------------------------
   SAMPLE DATA
-------------------------------------------------------*/
const SAMPLE_RESPONSE: ApiResponseShape = {
  topDaysHeld: {
    US: [
      { ticker: "AAPL", value: 12 },
      { ticker: "MSFT", value: 10 },
      { ticker: "TSLA", value: 9 },
      { ticker: "AMZN", value: 8 },
    ],
    EMEA: [
      { ticker: "SIE", value: 11 },
      { ticker: "ADS", value: 9 },
    ],
    APAC: [
      { ticker: "TSM", value: 14 },
      { ticker: "SONY", value: 10 },
    ],
  },
  topDtdPnL: {
    US: [
      { ticker: "NVDA", value: 15000 },
      { ticker: "AMD", value: 8000 },
    ],
    EMEA: [{ ticker: "RDSA", value: 5000 }],
    APAC: [{ ticker: "BABA", value: 7000 }],
  },
  topGainers: {
    US: [
      { ticker: "META", value: 3.5 },
      { ticker: "NFLX", value: 2.8 },
    ],
    EMEA: [{ ticker: "AIR", value: 4.1 }],
    APAC: [{ ticker: "TCS", value: 5.4 }],
  },
  currentPrice: {
    US: [
      { ticker: "GOOGL", value: 162.5 },
      { ticker: "AAPL", value: 188.2 },
    ],
    EMEA: [{ ticker: "VOW", value: 112.8 }],
    APAC: [{ ticker: "INFY", value: 23.1 }],
  },
}

/* ------------------------------------------------------
   REGION TABLE
-------------------------------------------------------*/
const RegionTable: React.FC<RegionTableProps> = ({
  region,
  columnLabel,
  rows,
}) => {
  const top10: RegionRow[] = rows?.slice(0, 10) || []

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
              </TableRow>
            </TableHead>
            <TableBody>
              {top10.map((row, idx) => (
                <TableRow key={`${region}-${row.ticker}-${idx}`}>
                  <TableCell>{row.ticker}</TableCell>
                  <TableCell align="right">{row.value}</TableCell>
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
  const data = SAMPLE_RESPONSE

  return (
    <Container
      maxWidth={false}
      sx={{ p: 3, backgroundColor: "#f5f6fa", minHeight: "100vh" }}
    >
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MetricSection
              title="Top 10 Days Held"
              columnLabel="Days Held"
              metricData={data.topDaysHeld}
            />
          </Grid>

          <Grid item xs={12}>
            <MetricSection
              title="Top 10 DTD P&L"
              columnLabel="DTD P&L"
              metricData={data.topDtdPnL}
            />
          </Grid>

          <Grid item xs={12}>
            <MetricSection
              title="Top 10 Gainers"
              columnLabel="Gain"
              metricData={data.topGainers}
            />
          </Grid>

          <Grid item xs={12}>
            <MetricSection
              title="Top 10 Current Price"
              columnLabel="Current Price"
              metricData={data.currentPrice}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default RegionWiseMDRTables
