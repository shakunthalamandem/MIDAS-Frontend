import React from "react";
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import { LightbulbOutlined } from "@mui/icons-material";
import IPOAITickersMain from "../Hooks/IPOAITickersMain";
import IPODashboardMainTable from "../IPODashboardMainTable";
import FinancialForecastTable from "../IPOFinancialTableMain";
import { cardStyle } from "../UtilsIPODashboard";

interface Props {
  selectedTicker: string;
  ipoData: any;
  showAIComparison: boolean;
  handleAIComparisonClick: () => void;
}

const IPODashboardPage4: React.FC<Props> = ({
  selectedTicker,
  ipoData,
  showAIComparison,
  handleAIComparisonClick,
}) => {
  return (
    <div id="ipo-dashboard-page4">
      <Container maxWidth="xl" sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          {/* Financial Forecast */}
          <Grid item xs={12}>
            <Card sx={{ ...cardStyle, backgroundColor: "#f9fafc" }}>
              <CardContent>
                <FinancialForecastTable defaultTicker={selectedTicker} />
              </CardContent>
            </Card>
          </Grid>
          {/* IPO Main Table */}
          <Grid item xs={12}>
            <Card sx={{ ...cardStyle, backgroundColor: "#f9fafc" }}>
              {/* <CardHeader title="Comparative Trading Multiples & Performance Metrics" sx={{ pb: 0, fontWeight: "bold" }} /> */}
              <CardContent>
                <IPODashboardMainTable ticker={selectedTicker} />
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
          </Grid>
          {/* AI Suggestions */}
          <Grid item xs={12}>
            <Card
              sx={{
                backgroundColor: "#f4f9ff",
                position: "relative",
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
                    sx={{
                      textTransform: "none",
                      fontWeight: 500,
                      minWidth: 140,
                    }}
                  >
                    {showAIComparison ? "Hide Suggestions" : "Show Suggestions"}
                  </Button>
                }
              />
              <CardContent>
                {showAIComparison && <IPOAITickersMain selectedData={ipoData} />}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default IPODashboardPage4;
