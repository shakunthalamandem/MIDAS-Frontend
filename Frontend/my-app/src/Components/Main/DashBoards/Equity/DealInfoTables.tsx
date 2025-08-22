import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Box,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";

interface Props {
  tickers: string[];
}

interface DealData {
  ticker: string;
  expected_listing_date: string;
  deal_color: string | null;
  deal_color_exist: "yes" | "no";
  valuation: "yes" | "no";
  t1d_prediction: string | null;
  t1d_prediction_exist: "yes" | "no";
}

const DealInfoTables: React.FC<Props> = ({ tickers }) => {
  const [dealDataMap, setDealDataMap] = useState<Record<string, DealData>>({});
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchDealStatus = async (ticker: string) => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${apiUrl}/api/unified_new_deal_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            type: "ticker_status",
            ticker,
          }),
        });

        const data = await response.json();

        if (data.error) {
          setErrorMap((prev) => ({ ...prev, [ticker]: data.error }));
        } else {
          setDealDataMap((prev) => ({ ...prev, [ticker]: data }));
        }
      } catch (err) {
        setErrorMap((prev) => ({
          ...prev,
          [ticker]: "Failed to fetch deal status",
        }));
      }
    };

    tickers.forEach((ticker) => {
      if (!dealDataMap[ticker] && !errorMap[ticker]) {
        fetchDealStatus(ticker);
      }
    });
  }, [tickers, dealDataMap, errorMap]);

  const renderStatusIcon = (exists: string) =>
    exists === "yes" ? (
      <CheckCircleOutlineIcon color="success" />
    ) : (
      <CancelIcon color="error" />
    );

  return (
    <Container maxWidth="lg">
      <Grid container direction="column" spacing={3} mt={1}>
        {tickers.map((ticker) => {
          const dealData = dealDataMap[ticker];
          const error = errorMap[ticker];

          return (
            <Grid item key={ticker}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 2 }}>
                <Box mb={3} textAlign="center">
                  <Typography variant="h5" fontWeight="bold">
                    {ticker} Deal Overview
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Deal Color */}
                  <Grid item xs={12} md={4} sx={{ display: "flex" }}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        minHeight: 150,
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          Deal Color
                        </Typography>
                        {error ? null : dealData ? (
                          renderStatusIcon(dealData.deal_color_exist)
                        ) : (
                          <CircularProgress size={20} />
                        )}
                      </Box>

                      {error ? (
                        <Typography color="error">{error}</Typography>
                      ) : dealData?.deal_color_exist === "yes" ? (
                        <Typography sx={{ whiteSpace: "pre-line" }}>
                          {dealData.deal_color}
                        </Typography>
                      ) : null}
                    </Paper>
                  </Grid>

                  {/* Valuation */}
                  <Grid item xs={12} md={4} sx={{ display: "flex" }}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        minHeight: 150,
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ mx: "auto" }}
                        >
                          Valuation
                        </Typography>

                        <Box ml="auto">
                          {error ? null : dealData ? (
                            renderStatusIcon(dealData.valuation)
                          ) : (
                            <CircularProgress size={20} />
                          )}
                        </Box>
                      </Box>

                      {error && (
                        <Typography color="error" textAlign="center">
                          {error}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>

                  {/* T+1 Prediction */}
                  <Grid item xs={12} md={4} sx={{ display: "flex" }}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        minHeight: 150,
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          T+1 Prediction
                        </Typography>
                        {error ? null : dealData ? (
                          renderStatusIcon(dealData.t1d_prediction_exist)
                        ) : (
                          <CircularProgress size={20} />
                        )}
                      </Box>

                      {error ? (
                        <Typography color="error">{error}</Typography>
                      ) : dealData?.t1d_prediction_exist === "yes" ? (
                        <Typography>
                          Prediction: {dealData.t1d_prediction}
                        </Typography>
                      ) : null}
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default DealInfoTables;
