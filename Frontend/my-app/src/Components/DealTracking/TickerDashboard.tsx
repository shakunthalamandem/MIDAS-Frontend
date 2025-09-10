import React, { useState } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  CircularProgress,
  Typography,
  Card,
  Container,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import TickerTracking from "./TickerTracking";

interface TickerOption {
  ticker: string;
  pricing_date: string;
  deal_type: string;
}

const TickerDashboard: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [options, setOptions] = useState<TickerOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Default selected value (optional)
  const [selected, setSelected] = useState<TickerOption | null>({
    ticker: "BLSH",
    pricing_date: "2025-08-13",
    deal_type: "IPO",
  });

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

  // 👇 Ensure we always pass a string
  const ticker = tickerFromUrl || selected?.ticker || "";

  // 👇 If no pricing date is found, set to '""'
  const pricingDate =
    pricingDateFromUrl ||
    selected?.pricing_date ||
    '""'; // This ensures it is passed as `""`

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
          <Typography variant="h6" fontWeight={700} color="#002060">
            Deal Tracking Dashboard
          </Typography>

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

        <Typography variant="subtitle1" align="left" sx={{ mt: 2, mb: 2 }}>
          Welcome to the <strong>Ticker Tracking Dashboard</strong>. Use the search bar
          in the top-right corner to find a specific ticker. Once selected, you’ll see
          its detailed lifecycle, including pricing information, allocations, predictions,
          and actual performance, all organized step-by-step for easy tracking.
        </Typography>

        {/* Render only if ticker exists */}
        {ticker && (
          <Box mt={3}>
            <TickerTracking ticker={ticker} pricing_date={pricingDate} />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default TickerDashboard;
