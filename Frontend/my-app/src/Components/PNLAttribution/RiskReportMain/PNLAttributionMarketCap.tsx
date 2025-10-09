import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  CircularProgress,
  Box,
  Grid,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
} from "recharts";

interface RiskReportData {
  cumulative_fund_return: any[];
  net_of_hedge_pnl: any;
  attribution_by_market_cap: any;
  historical_exposure_by_region: any;
  report_date: string;
}

interface PNLAttributionMarketCapProps {
  fund: string;
}

const PNLAttributionMarketCap: React.FC<PNLAttributionMarketCapProps> = ({ fund }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<RiskReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch(`${apiUrl}/api/risk_report_chart_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ fund }),
        });

        const data = await res.json();
        if (
          data.cumulative_fund_return &&
          data.net_of_hedge_pnl &&
          data.attribution_by_market_cap &&
          data.historical_exposure_by_region
        ) {
          setChartData(data);
        } else {
          setError("Incomplete data returned from API.");
        }
      } catch (error) {
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fund]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  if (!chartData)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Alert severity="warning">Data is unavailable.</Alert>
      </Box>
    );

  const {
    cumulative_fund_return,
    net_of_hedge_pnl,
    attribution_by_market_cap,
    historical_exposure_by_region,
  } = chartData;

  // 1️⃣ Cumulative Fund Return Chart
  const cumulativeReturnChartData = cumulative_fund_return?.map((item: any) => ({
    date: item.date,
    fundReturn: item.fund_return,
    msciReturn: item.msci_return,
    spxReturn: item.spx_return,
  }));


  const historicalReturnChartData = historical_exposure_by_region?.map((item: any) => ({
    date: item.date,
    USReturn: item.US,
    EMEAReturn: item.EMEA,
    APACReturn: item.APAC,
    HedgeReturn: item.Hedge,

  }));


  const netOfHedgeTableData = Object.keys(net_of_hedge_pnl["NetOfHedgeP&L(%)"] || {}).map(
    (region) => ({
      region,
      netOfHedgePnlPercent: net_of_hedge_pnl["NetOfHedgeP&L(%)"][region],
      longExposure: net_of_hedge_pnl["LongExposure/LMV(%)"][region],
      betaAdjLongExp: net_of_hedge_pnl["BetaAdj.LongExp./LMV(%)"][region],
      netOfHedgePnl: net_of_hedge_pnl["NetOfHedgeP&L"][region],
    })
  );

  // Colors
  const colors = ["#FF7F0E", "#1F77B4", "#2CA02C"]; // orange, blue, green

  // Pie chart (LongExposureLMVPercent)
  const pieChartData = attribution_by_market_cap?.LongExposureLMVPercent?.map((item: any, index: number) => ({
    name: item.category,
    value: item.pnl_percentage,
    color: colors[index % colors.length],
  }));

  // Bar chart (NetOfHedgePNL)
  const barChartData = attribution_by_market_cap?.NetOfHedgePNL?.map((item: any, index: number) => ({
    name: item.category,
    value: item.pnl_percentage,
    color: colors[index % colors.length],
  }));


// 4️⃣ Area chart for historical exposure


  return (
    <Grid container spacing={3}>
      {/* 1️⃣ Cumulative Fund Return */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2, backgroundColor: "#f9f9f9" }}>
          <Typography
            variant="h6"
            gutterBottom
            color="#002060"
            align="center"
            bgcolor={"#e6f0ff"}
            fontWeight={600}
          >
            Cumulative Fund Return vs Market Return
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={cumulativeReturnChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="linear" dataKey="fundReturn" stroke="#002060" />
              <Line type="linear" dataKey="msciReturn" stroke="#0070C0" />
              <Line type="linear" dataKey="spxReturn" stroke="#00B0F0" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* 2️⃣ Table Section */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e6f0ff" }}>
              <TableCell align="center">Region</TableCell>
              <TableCell align="center" color="#002060" >Net Of Hedge P&L(%)</TableCell>
              <TableCell align="center" color="#002060" >Long Exposure / LMV(%)</TableCell>
              <TableCell align="center" color="#002060" >Beta Adj.Long Exp./LMV(%)</TableCell>
              <TableCell align="center" color="#002060" >Net Of Hedge P&L</TableCell>
            </TableRow>
          </TableHead>

            <TableBody>
              {netOfHedgeTableData.map((row) => (
                <TableRow key={row.region}>
                  <TableCell align="center">{row.region}</TableCell>
                  <TableCell align="center">{row.netOfHedgePnlPercent}</TableCell>
                  <TableCell align="center">{row.longExposure}</TableCell>
                  <TableCell align="center">{row.betaAdjLongExp}</TableCell>
                  <TableCell align="center">{row.netOfHedgePnl}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid>

      {/* 3️⃣ Bar + Pie Charts */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2, backgroundColor: "#f9f9f9" }}>
          <Typography
            variant="h6"
            gutterBottom
            color="#002060"
            align="center"
            fontWeight={600}
            bgcolor={"#e6f0ff"}
          >
            Attribution by Market Cap
          </Typography>

          <Grid container spacing={3}>
            {/* Bar Chart */}
          <Grid item xs={12} md={6}>
  <Typography variant="subtitle1" gutterBottom color="#002060" align="center">
    Net Of Hedge P&L (%)
  </Typography>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart 
      data={barChartData} 
      layout="vertical" // <-- This makes the bars horizontal
      margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
    >
      <XAxis type="number" />          {/* Numeric axis */}
      <YAxis dataKey="name" type="category" /> {/* Categorical axis */}
      <Tooltip />
      <Legend />
      <Bar dataKey="value">
        {barChartData.map((entry: { color: string | undefined }, index: number) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</Grid>


            {/* Pie Chart */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom color="#002060" align="center">
                Long Exposure
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius="80%"
                    label={(entry) => entry.name}
                  >
                    {pieChartData.map((entry: { color: string | undefined; }, index: any) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2, backgroundColor: "#f9f9f9" }}>
          <Typography
            variant="h6"
            gutterBottom
            color="#002060"
            align="center"
            bgcolor={"#e6f0ff"}
            fontWeight={600}
          >
            Cumulative Fund Return vs Market Return
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historicalReturnChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="linear" dataKey="APACReturn" stroke="#002060" />
              <Line type="linear" dataKey="USReturn" stroke="#0070C0" />
              <Line type="linear" dataKey="EMEAReturn" stroke="#00B0F0" />
              <Line type="linear" dataKey="HedgeReturn" stroke="#002060" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>



  </Grid>
  );
};

export default PNLAttributionMarketCap;
