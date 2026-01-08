import React, { useState } from "react";
import { Box, Card, Container, Typography } from "@mui/material";
import { TickerSelectionPayload } from "./types";
import DealPricesChart from "./DealPricesChart";
import DealsPredictionsTable from "./DealsPredictionsTable";

const AIMLResultsHome: React.FC = () => {
  const [chartSelection, setChartSelection] =
    useState<TickerSelectionPayload | null>(null);

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        minHeight: "calc(100vh - 64px)", // adjust if you have a different header height
        py: 2,
      }}
    >
      <Box
        sx={{
          px: { xs: 1.5, sm: 3, md: 6, lg: 8 },
        }}
      >
        <Box
          sx={{
            fontWeight: 500,
            color: "#FFFFFF",
            fontSize: { xs: "1rem", sm: "1.15rem" },
            backgroundColor: "#002060",
            textAlign: "center",
            py: 1.25,
            borderRadius: 2,
            mb: 2.5,
          }}
        >
          Welcome to the AI-ML Results Dashboard! Here, you can explore and
          analyze the outcomes of our machine learning models.
        </Box>

        <Card
          sx={{
            borderRadius: 2,
            boxShadow: 4,
            p: { xs: 2, md: 3 },
          }}
        >
          <Typography
            variant="h6"
            fontWeight={600}
            textAlign={"center"}
            color="#002060"
          >
            IPO & FO Deals – Prediction Summary
          </Typography>

          <Box
            sx={{
              backgroundColor: "#f7f9fc",
              p: { xs: 2, md: 3 },
              borderRadius: 2,
            }}
          >
            <DealsPredictionsTable onTickerClick={setChartSelection} />
          </Box>
        </Card>

        {/* <Box mt={3}>
          {chartSelection ? (
            <DealPricesChart
              ticker={chartSelection.ticker}
              trade_date={chartSelection.trade_date}
            />
          ) : (
            <Card
              sx={{
                mt: 1,
                p: 2,
                borderRadius: 2,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              Click a ticker in the table to view its price timeseries.
            </Card>
          )}
        </Box> */}
      </Box>
    </Container>
  );
};

export default AIMLResultsHome;
