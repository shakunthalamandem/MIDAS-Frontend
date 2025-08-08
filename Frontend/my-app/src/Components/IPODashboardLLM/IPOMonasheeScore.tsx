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
}

const IPOMonasheeScore: React.FC<IPOMonasheeScoreProps> = ({
  ticker,
  monasheeScore = 0,
}) => {
  const [data, setData] = useState<SectorDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatNumber = (value: number) => {
    if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  useEffect(() => {
    if (!ticker) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          `${apiUrl}/api/ipo_related_sector_data/?ticker=${ticker}`,
          {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          }
        );
        const json = await res.json();
        if (!res.ok || !json.sector_data)
          throw new Error(json.error || "No data");
        setData(json.sector_data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ticker]);

  if (loading) return <CircularProgress size={24} />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (data.length === 0)
    return <Typography>No related IPO data found.</Typography>;

  return (
    <Box>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 2,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#002060" }}>
              {[
                "Ticker",
                "Pricing Date",
                "Issuer Name",
                "Deal Size",
                "1 Day Return (%)",
                "1 Month Return (%)",
              ].map((header, index, arr) => (
                <TableCell
                  key={header}
                  align="center"
                  sx={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    borderRight:
                      index !== arr.length - 1 ? "1px solid #ddd" : "none",
                    py: 1.5,
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, idx) => (
              <TableRow
                key={row.ticker_us + row.pricing_date}
                sx={{
                  backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f7f9fc",
                  "&:hover": { backgroundColor: "#e8f0fe" },
                  transition: "background-color 0.2s ease-in-out",
                }}
              >
                {[
                  row.ticker_us,
                  row.pricing_date,
                  row.issuer_name,
                  formatNumber(row.deal_size),
                  row.t1d_return_from_bloomberg.toFixed(2),
                  row.t1m_return_from_bloomberg.toFixed(2),
                ].map((value, index, arr) => (
                  <TableCell
                    key={index}
                    align="center"
                    sx={{
                      borderRight:
                        index !== arr.length - 1 ? "1px solid #ddd" : "none",
                    }}
                  >
                    {value}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} p={2} sx={{ backgroundColor: "#f9fafb", borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Based on the current IPO and market data - considering deal count,
          deal volume, positively performed deals, opportunity value excess, and
          excess returns.
        </Typography>
      </Box>
    </Box>
  );
};

export default IPOMonasheeScore;
