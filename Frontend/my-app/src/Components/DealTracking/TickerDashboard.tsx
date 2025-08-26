import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  CircularProgress,
  Typography,
  Card,
  Container,
  Button,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom"; // useNavigate here
import TickerTracking from "./TickerTracking"; // Correct import

interface TickerOption {
  ticker: string;
  pricing_date: string;
  deal_type: string;
}

const TickerDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate(); // useNavigate hook for navigation
  const queryParams = new URLSearchParams(location.search);

  const [options, setOptions] = useState<TickerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<TickerOption | null>(null);

  // Extract ticker and pricing_date from URL query params
  const tickerFromUrl = queryParams.get("ticker");
  const pricingDateFromUrl = queryParams.get("pricing_date");

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleOpen = async () => {
    if (options.length === 0) {
      setLoading(true);
      try {
        const res = await axios.get<{ data: TickerOption[] }>(
          `${apiUrl}/api/unified_deal_ticker_list/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // ✅ Sort tickers by pricing_date DESC using dayjs for reliability
        const sorted = res.data.data.sort((a, b) =>
          dayjs(b.pricing_date).valueOf() - dayjs(a.pricing_date).valueOf()
        );

        setOptions(sorted);
      } catch (err) {
        console.error("Error fetching tickers:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelect = (_: any, value: TickerOption | null) => {
    setSelected(value);
  };

  const handleTrackHereClick = () => {
    if (selected) {
      const url = `/deals/dashboard/Tracking?ticker=${selected.ticker}&pricing_date=${selected.pricing_date}`;
      // Open the URL in a new tab
      window.open(url, "_blank");
    }
  };

  // Use URL params if available, otherwise, rely on the selected state
  const ticker = tickerFromUrl || selected?.ticker;
  const pricingDate = pricingDateFromUrl || selected?.pricing_date;

  return (
    <Box sx={{ minHeight: "100vh", background: "#f5f7fa", py: 3 }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Card
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderRadius: 3,
            boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
            background: "linear-gradient(135deg, #ffffff, #f0f4f8)",
          }}
        >
          {/* Title */}
          <Typography variant="h6" fontWeight={700}>
            Deal Tracking Dashboard
          </Typography>

          {/* Search Bar */}
          <Autocomplete
            sx={{ width: 350 }}
            options={options}
            loading={loading}
            onOpen={handleOpen}
            value={selected}
            getOptionLabel={(option) =>
              `${option.ticker} - ${dayjs(option.pricing_date).format(
                "DD MMM YYYY"
              )} * ${option.deal_type}`
            }
            isOptionEqualToValue={(opt, val) =>
              opt.ticker === val.ticker && opt.pricing_date === val.pricing_date
            }
            onChange={handleSelect}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Ticker"
                variant="outlined"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Card>

        <Typography
          variant="subtitle1"
          align="left"
          sx={{ mt: 2, mb: 2 }}
        >
          Welcome to the <strong>Ticker Tracking Dashboard</strong>. Use the search bar
          in the top-right corner to find a specific ticker. Once selected, you’ll see
          its detailed lifecycle, including pricing information, allocations, predictions,
          and actual performance, all organized step-by-step for easy tracking.
        </Typography>

        {/* Ticker Tracking aligned with header */}
        {ticker && pricingDate && (
          <Box mt={3}>
            {/* Pass ticker and pricing_date as props */}
            <TickerTracking ticker={ticker} pricing_date={pricingDate} />
          </Box>
        )}

        {/* Button to track the selected ticker */}
        {selected && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleTrackHereClick}
            >
              Track Here
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default TickerDashboard;
