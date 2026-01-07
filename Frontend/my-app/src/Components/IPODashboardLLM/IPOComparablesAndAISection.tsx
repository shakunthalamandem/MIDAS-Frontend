// src/components/IPODashboardMain/IPOComparablesAndAISection.tsx
import React, { useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  CardHeader,
  Button,
  Box,
} from "@mui/material";
import { LightbulbOutlined } from "@mui/icons-material";
import IPODashboardMainTable from "./IPODashboardMainTable";
import IPOAITickersMain from "./Hooks/IPOAITickersMain";
import { SelectedData } from "./IPODealsS1DealData";
import FinancialMetricsBarCharts from "./FinancialMetricsBarCharts";

interface Props {
  selectedData: SelectedData;
}

const IPOComparablesAndAISection: React.FC<Props> = ({ selectedData }) => {
  const [showAIComparison, setShowAIComparison] = useState(false);
  const [chartRefreshToken, setChartRefreshToken] = useState(0);

  const handleAIComparisonClick = () => {
    setShowAIComparison((prev) => !prev);
  };

  const handlePeersUpdated = () => {
    setChartRefreshToken((prev) => prev + 1);
  };

  return (
    <>
      {/* COMPARATIVE TABLE */}
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Card variant="outlined" sx={{ boxShadow: 2, borderRadius: 2 }}>
          <CardContent
            sx={{ background: "linear-gradient(#f0f5ff, #f0f5ff)" }}
          >
            <IPODashboardMainTable
              ticker={selectedData?.ticker_name ?? ""}
              pricingDate={selectedData?.pricing_date}
              onPeersUpdated={handlePeersUpdated}
            />
            <Typography
              variant="caption"
              display="block"
              align="right"
              sx={{ fontStyle: "italic", color: "gray", mt: 1 }}
            >
              Source: Factset
            </Typography>
          </CardContent>
        </Card>
      </Container>

      {/* AI COMPARISON */}
      <Container maxWidth="xl" sx={{ mt: 4 }}   className="pdf-hidden">
        <Card
          sx={{
            backgroundColor: "#f4f9ff",
            animation: showAIComparison ? "glowPulse 2s ease-out" : "none",
            "@keyframes glowPulse": {
              "0%": { boxShadow: "0 0 0px rgba(0, 150, 255, 0)" },
              "50%": { boxShadow: "0 0 20px rgba(0, 150, 255, 0.5)" },
              "100%": { boxShadow: "0 0 0px rgba(0, 150, 255, 0)" },
            },
          }}
        >
          <CardHeader
            avatar={<LightbulbOutlined color="primary" />}
            title={
              <Typography variant="h6" color="primary" fontWeight={600}>
                Get AI-Recommended Comparative Tickers
              </Typography>
            }
            action={
              <Button
                variant={showAIComparison ? "outlined" : "contained"}
                color="primary"
                onClick={handleAIComparisonClick}
                sx={{ textTransform: "none", fontWeight: 500 }}
              >
                {showAIComparison ? "Hide Suggestions" : "Show Suggestions"}
              </Button>
            }
          />
          <CardContent>
            {showAIComparison && (
              <IPOAITickersMain selectedData={selectedData} />
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Financial metrics (breaks out to its own PDF page) */}
      <Container
        id="ipo-dashboard-financial-metrics"
        data-pdf-breakout="financial-metrics"
        maxWidth="xl"
        sx={{ mt: 4 }}
      >
        <FinancialMetricsBarCharts
          ticker={selectedData?.ticker_name ?? ""}
          refreshToken={chartRefreshToken}
        />
      </Container>
    </>
  );
};

export default IPOComparablesAndAISection;
