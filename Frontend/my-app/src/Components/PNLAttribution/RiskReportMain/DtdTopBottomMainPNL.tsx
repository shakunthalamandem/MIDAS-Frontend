import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  CircularProgress,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DtdTopBottomMainPNLProps {
  fund: string;
  date?: string;
}

const DtdTopBottomMainPNL: React.FC<DtdTopBottomMainPNLProps> = ({
  fund,
  date,
}) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);
  const [topTable, setTopTable] = useState([]);
  const [bottomTable, setBottomTable] = useState([]);
  const [reportDate, setReportDate] = useState("");

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch(
          `${apiUrl}/api/risk_report_top_loss_exposure_pnl/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({ fund, date }),
          }
        );

        if (!res.ok) throw new Error("Failed to fetch chart data");

        const data = await res.json();

        // Set tables
        setTopTable(data.top_pnl || []);
        setBottomTable(data.bottom_pnl || []);
        setReportDate(data.report_date || "");

        // Set chart
        const chartItems = data.dtd_net_of_hedge_gain_loss || [];
        setChartData({
          labels: chartItems.map((item: any) => item.ticker),
          datasets: [
            {
              label: "DTD P&L",
              data: chartItems.map((item: any) => item.pnl_value),
              backgroundColor: chartItems.map((item: any) =>
                item.pnl_value >= 0
                  ? "rgba(0, 160, 0, 0.7)"
                  : "rgba(200, 0, 0, 0.7)"
              ),
            },
          ],
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchChartData();
  }, [fund, date]);

  if (loading || !chartData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{ p: 3, borderRadius: 2, backgroundColor: "#f9f9f9" }}
    >
      {/* Summary Section */}
      <Typography
        variant="h6"
        gutterBottom
        color="#002060"
        align="center"
        fontWeight={600}
      >
        Summary
      </Typography>

      {/* Container for Chart and Tables in one row */}
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="flex-start"
      >
        {/* Chart Section */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="subtitle1"
            gutterBottom
            color="#002060"
            align="center"
            bgcolor={"#e6f0ff"}
          >
            DTD Net of Hedge Gain/Loss over $100K
          </Typography>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              indexAxis: "y",
              plugins: {
                legend: { display: false },
                tooltip: { mode: "index", intersect: false },
              },
              scales: {
                x: {
                  title: { display: true, text: "P&L ($)" },
                  grid: { display: false },
                  ticks: {
                    callback: (value: any) => `$${(value / 1000).toFixed(0)}K`,
                  },
                },
                y: { title: { display: false }, grid: { display: false } },
              },
            }}
            height={250}
          />
        </Grid>

        {/* Top P&L Table */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="subtitle1"
            color="#002060"
            gutterBottom
            align="center"
            bgcolor={"#e6f0ff"}
          >
            Top P&L as on {reportDate}
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell style={{ color: "#002060" }}>Ticker</TableCell>
                  <TableCell align="right" style={{ color: "#002060" }}>
                    Net of Hedge P&L (%)
                  </TableCell>
                  <TableCell align="right" style={{ color: "#002060" }}>
                    Long Exposure/LMV (%)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topTable.map((row: any, idx: number) => (
                  <TableRow
                    key={idx}
                    style={{
                      backgroundColor:
                        idx % 2 === 0 ? "#f5f5f5" : "transparent",
                    }}
                  >
                    <TableCell>{row.ticker || "-"}</TableCell>
                    <TableCell align="right">
                      {(row.net_of_hedge_pnl_percent ?? 0).toFixed(2)}%
                    </TableCell>
                    <TableCell align="right">
                      {(row.long_exposure_lmv ?? 0).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Bottom P&L Table */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="subtitle1"
            color="#002060"
            gutterBottom
            align="center"
            bgcolor={"#e6f0ff"}
          >
            Bottom P&L as on {reportDate}
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell style={{ color: "#002060" }}>Ticker</TableCell>
                  <TableCell align="right" style={{ color: "#002060" }}>
                    Net of Hedge P&L(%)
                  </TableCell>
                  <TableCell align="right" style={{ color: "#002060" }}>
                    Long Exposure/LMV(%)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bottomTable.map((row: any, idx: number) => (
                  <TableRow
                    key={idx}
                    style={{
                      backgroundColor:
                        idx % 2 === 0 ? "#f5f5f5" : "transparent",
                    }}
                  >
                    <TableCell>{row.ticker || "-"}</TableCell>
                    <TableCell align="right">
                      {(row.net_of_hedge_pnl_percent ?? 0).toFixed(2)}%
                    </TableCell>
                    <TableCell align="right">
                      {(row.long_exposure_lmv ?? 0).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DtdTopBottomMainPNL;
