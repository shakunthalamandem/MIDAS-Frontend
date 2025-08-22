import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";
interface Props {
  ticker: string;
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

const DealInfoTables: React.FC<Props> = ({ ticker }) => {
  const [dealData, setDealData] = useState<DealData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDealStatus = async () => {
      try {
        if (!ticker ) return;

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
          setError(data.error);
        } else {
          setDealData(data);
        }
      } catch (err) {
        setError("Failed to fetch deal status");
      }
    };

    fetchDealStatus();
  }, [ticker]);


  const renderStatus = (label: string, exists: string) => (
    <Box display="flex" alignItems="center" mb={1}>
      <Typography sx={{ minWidth: 130 }}>{label}:</Typography>
      {exists === "yes" ? (
        <CheckCircleOutlineIcon color="success" />
      ) : (
        <CancelIcon color="error" />
      )}
    </Box>
  );

  return (
    <Container maxWidth="md">
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {ticker && (
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {ticker} – Deal Info
              </Typography>
            )}

            {error ? (
              <Typography color="error">{error}</Typography>
            ) : dealData ? (
              <>
                {renderStatus("Deal Color", dealData.deal_color_exist)}
                {dealData.deal_color_exist === "yes" && (
                  <Typography mt={1} sx={{ whiteSpace: "pre-line" }}>
                    {dealData.deal_color}
                  </Typography>
                )}

                {renderStatus("Valuation", dealData.valuation)}
                {renderStatus("T+1 Prediction", dealData.t1d_prediction_exist)}
                {dealData.t1d_prediction_exist === "yes" && (
                  <Typography mt={1}>
                    Prediction: {dealData.t1d_prediction}
                  </Typography>
                )}
              </>
            ) : (
              <Typography>Loading...</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DealInfoTables;
