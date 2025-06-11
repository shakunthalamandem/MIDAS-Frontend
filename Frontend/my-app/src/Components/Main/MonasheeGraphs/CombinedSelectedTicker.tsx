import React, { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import axios from "axios";
import MDDSearchSummary from "../MonasheeDeals/MddGraphs/MDDSearchSummary";
import {
  SelectedTickerProps,
  ApiResponse,
  formatDate,
  formatNumber,
} from "./tickerUtils";
import HistoricalDealogicCards from "./HistoricalDealogicCards";
import { renderMonasheeDeals } from "./MonasheeDealsCards";

const ArrowValue = ({ value }: { value: number | null | undefined }) => {
  if (value === null || value === undefined) return <>N/A</>;

  const color = value > 0 ? "green" : value < 0 ? "red" : "black";
  const Icon =
    value > 0
      ? ArrowDropUpIcon
      : value < 0
        ? ArrowDropDownIcon
        : ArrowDropDownIcon;

  return (
    <span style={{ color, display: "flex", alignItems: "center" }}>
      {value.toFixed(2)}%
      <Icon sx={{ color, ml: 0.5, fontSize: 20 }} />
    </span>
  );
};

const CombinedSelectedTicker: React.FC<SelectedTickerProps> = ({ ticker }) => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!ticker) return;

    setLoading(true);
    setError(null);

    axios
      .post<ApiResponse>(
        `${apiUrl}/api/mdd_dealogic_search_ticker/`,
        { ticker },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      )
      .then((res) => {
        setData(res.data);
        setSummary(res.data.mdd_data.summary);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, [ticker, apiUrl, token]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" mt={4} textAlign="center">
        {error}
      </Typography>
    );

  if (!data) return null;
  return (
    <Box
      sx={{
        width: "100",
        minHeight: "100vh",
        padding: 3,
        bgcolor: "#fafafa",
        overflowX: "hidden",
      }}
    >
      <Grid container spacing={3}>
        {/* === Dealogic Data === */}
        <Grid item xs={12} md={6}>
          {HistoricalDealogicCards(ticker, data?.dealogic_data?.data || [])}
        </Grid>

        {/* === MDD Data === */}

        <Grid item xs={12} md={6}>
          {renderMonasheeDeals(data, ticker)}
        </Grid>
      </Grid>
    </Box>
  );
};

export default CombinedSelectedTicker;
