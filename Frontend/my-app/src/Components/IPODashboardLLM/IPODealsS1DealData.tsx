import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  CircularProgress,
  IconButton,
  Collapse,
  Tooltip,
} from "@mui/material";
import {
  FaBullseye,
  FaHandshake,
  FaTruckMoving,
  FaChartLine,
  FaClipboardList,
} from "react-icons/fa";
import { motion } from "framer-motion"; // For animations

type DealData = {
  fair_value_estimate: string;
  indication_of_interest: string;
  after_market_threshold: string;
  monashee_score: number;
  differentiated_summary: string;
};

interface IPODealsS1DealDataProps {
  selectedTicker: string | null;
}

const IPODealsS1DealData: React.FC<IPODealsS1DealDataProps> = ({ selectedTicker }) => {
  const [dealData, setDealData] = useState<DealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) {
        setError("API URL is not defined in environment variables");
        setLoading(false);
        return;
      }

      if (!selectedTicker) {
        setError("No selected ticker provided.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/ipo_deal_data_fairvalues/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker: selectedTicker }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Failed to fetch deal data");
        }

        const data = await response.json();
        if (data && Array.isArray(data) && data.length > 0) {
          setDealData(data[0]);
        } else {
          setError("No deal data available.");
        }
      } catch (err: any) {
        setError(err.message || "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (selectedTicker) {
      fetchDeals();
    }
  }, [selectedTicker]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!dealData) return <Typography>No deal data found.</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 600, margin: "auto" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card variant="outlined">
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <FaBullseye size={24} color="#1976d2" />
              </Grid>
              <Grid item xs>
                <Typography variant="h6">Fair Value Estimate</Typography>
                <Typography>{dealData.fair_value_estimate}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card variant="outlined">
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <FaHandshake size={24} color="#1976d2" />
              </Grid>
              <Grid item xs>
                <Typography variant="h6">Indication of Interest (IOI)</Typography>
                <Typography>Initial interest: {dealData.indication_of_interest}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card variant="outlined">
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <FaTruckMoving size={24} color="#1976d2" />
              </Grid>
              <Grid item xs>
                <Typography variant="h6">After Market (AM) Threshold</Typography>
                <Typography>{dealData.after_market_threshold}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card variant="outlined">
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <FaChartLine size={24} color="#1976d2" />
              </Grid>
              <Grid item xs>
                <Typography variant="h6">Monashee Score</Typography>
                <Typography>{dealData.monashee_score} / 10 (based on similar IPOs)</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card variant="outlined">
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <FaClipboardList size={24} color="#1976d2" />
              </Grid>
              <Grid item xs>
                <Typography variant="h6">Differentiated Summary</Typography>
                <Tooltip title={dealData.differentiated_summary}>
                  <Typography noWrap>{dealData.differentiated_summary}</Typography>
                </Tooltip>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default IPODealsS1DealData;
