import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  CircularProgress,
  Box,
  FormControlLabel,
  Checkbox,
  Container,
} from "@mui/material";
import axios from "axios";
import { SelectedTickerProps, ApiResponse } from "./tickerUtils";
import HistoricalDealogicCards from "./HistoricalDealogicCards";
import renderMonasheeDeals from "./MonasheeDealsCards";

const CombinedSelectedTicker: React.FC<SelectedTickerProps> = ({ ticker }) => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [showDealogic, setShowDealogic] = useState(false);

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

  const hasMddData =
    Array.isArray(data.mdd_data?.data) && data.mdd_data.data.length > 0;
  const hasDealogicData =
    Array.isArray(data.dealogic_data?.data) &&
    data.dealogic_data.data.length > 0;

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        padding: 3,
        bgcolor: "#fafafa",
        overflowX: "hidden",
      }}
    >
      <Grid container spacing={3}>
        {/* === Case 1: Only MDD Available === */}
        {hasMddData && !hasDealogicData && (
          <Container>{renderMonasheeDeals(data, ticker)}</Container>
        )}

        {/* === Case 2: Only Dealogic Available === */}
        {!hasMddData && hasDealogicData && (
          <Container>
            {HistoricalDealogicCards(ticker, data.dealogic_data.data)}
          </Container>
        )}

        {/* === Case 3: Both Available === */}
        {hasMddData && hasDealogicData && (
          <>
            <Container>{renderMonasheeDeals(data, ticker)}</Container>
            <Container>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showDealogic}
                    onChange={(e) => setShowDealogic(e.target.checked)}
                    sx={{
                      color: "#002060",
                      "&.Mui-checked": {
                        color: "#002060",
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    variant="body1"
                    sx={{ color: "#002060", fontWeight: 500 }}
                  >
                    Do you want to see Dealogic deals?
                  </Typography>
                }
              />
            </Container>
            {showDealogic && (
              <Container>
                {HistoricalDealogicCards(ticker, data.dealogic_data.data)}
              </Container>
            )}
          </>
        )}

        {/* === Case 4: No Data === */}
        {!hasMddData && !hasDealogicData && (
          <Grid item xs={12}>
            <Typography textAlign="center" color="textSecondary">
              No data available for this ticker.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default CombinedSelectedTicker;
