import React, { useEffect, useState } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface SectorDataItem {
  ticker_us: string;
  pricing_date: string;
  issuer_name: string;
  deal_size: number;
  t1d_return_from_bloomberg: number;
  t1m_return_from_bloomberg: number;
}

interface IPOMonasheeScoreProps {
  ticker: string;
  monasheeScore?: number;
  selectedMetric?: "count" | "other";
}

const IPOMonasheeScore: React.FC<IPOMonasheeScoreProps> = ({
  ticker,
  monasheeScore = 0,
  selectedMetric = "other",
}) => {
  const [data, setData] = useState<SectorDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatNumber = (value: number): string => {
    if (selectedMetric === "count") return value.toString();

    const absValue = Math.abs(value);
    let formattedValue: string;

    if (absValue >= 1e9) {
      formattedValue = `${(absValue / 1e9).toFixed(1)}B`;
    } else if (absValue >= 1e6) {
      formattedValue = `${(absValue / 1e6).toFixed(1)}M`;
    } else if (absValue >= 1e3) {
      formattedValue = `${(absValue / 1e3).toFixed(1)}K`;
    } else {
      formattedValue = absValue.toString();
    }

    return value < 0 ? `-${formattedValue}` : formattedValue;
  };

  useEffect(() => {
    if (!ticker) return;

    const fetchMonasheeScoreData = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        if (!apiUrl) throw new Error("API URL not configured");

        const token = localStorage.getItem("access_token");

        const response = await fetch(`${apiUrl}/api/ipo_related_sector_data?ticker=${ticker}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        

        const jsonData = await response.json();

        if (!response.ok) {
          setError(jsonData.error || "Failed to fetch Monashee scores");
          setData([]);
          return;
        }

        if (!jsonData.sector_data || !Array.isArray(jsonData.sector_data)) {
          if (jsonData.error === "No sector data found.") {
            setError("No sector data for this ticker.");
          } else {
            setError("Unexpected response format");
          }
          setData([]);
          return;
        }

        setData(jsonData.sector_data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMonasheeScoreData();
  }, [ticker]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (data.length === 0)
    return <Typography>No Monashee score data available for this ticker.</Typography>;

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 2 }}>
      <TableContainer component={Paper} elevation={1}>
        <Table
          size="small"
          aria-label="Monashee Score Table"
          sx={{ borderCollapse: "collapse" }}
        >
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: "bold", border: "1px solid #ccc" }}>
                Ticker US
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", border: "1px solid #ccc" }}>
                Issuer Name
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", border: "1px solid #ccc" }}>
                Deal Size
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", border: "1px solid #ccc" }}>
                1 Day Return (%)
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", border: "1px solid #ccc" }}>
                1 Month Return (%)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(
              ({
                ticker_us,
                pricing_date,
                issuer_name,
                deal_size,
                t1d_return_from_bloomberg,
                t1m_return_from_bloomberg,
              }) => (
                <TableRow key={ticker_us + pricing_date}>
                  <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                    {ticker_us}
                  </TableCell>
                  <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                    {issuer_name}
                  </TableCell>
                  <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                    {formatNumber(deal_size)}
                  </TableCell>
                  <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                    {t1d_return_from_bloomberg.toFixed(2)}
                  </TableCell>
                  <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                    {t1m_return_from_bloomberg.toFixed(2)}
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 👇 Footnote Section */}
      <Box
        mt={2}
        display="flex"
        justifyContent="center"
        alignItems="center"
        textAlign="center"
        flexDirection="row"
      >
        <Typography variant="body2" color="text.secondary">
          Based on deal volume and current IPO, the Monashee score is{" "}
          <strong>{monasheeScore} / 10</strong> (based on similar IPOs)
        </Typography>
        <Tooltip title="This score is calculated by comparing key metrics against similar IPOs.">
          <InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5, color: "gray" }} />
        </Tooltip>
      </Box>
    </Box>
  );
};

export default IPOMonasheeScore;
