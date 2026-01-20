import React from "react";
import {
  Box,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FindInPageOutlinedIcon from "@mui/icons-material/FindInPageOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import NewspaperOutlinedIcon from "@mui/icons-material/NewspaperOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import { formatDate } from "./NewDashboardLifeCycleUtils";
import PageUnderDevelopment from "../../Pages/PageUnderDevelopment";
import NewDashboardLifeCycleTickerSearch from "./NewDashboardLifeCycleTickerSearch";
import WriteUpIPODashbaord from "../IPOwriteUp/IPOWriteUpDashboard/WriteUpIPODashbaord";
import FOWriteUpDashboardMain from "../Main/FOWriteUpMain/FOWriteUpDashboardMain";

const NewDashboardLifeCycleDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const payload = (location.state as { payload?: any } | null)?.payload;
  const [selectedOption, setSelectedOption] = React.useState<any | null>(null);
  const [tabValue, setTabValue] = React.useState(0);

  const tabItems = [
    { label: "Overview", icon: <DashboardOutlinedIcon fontSize="small" /> },
    { label: "S1 AI Query", icon: <FindInPageOutlinedIcon fontSize="small" /> },
    { label: "Write up", icon: <ArticleOutlinedIcon fontSize="small" /> },
    { label: "ML Model", icon: <PsychologyOutlinedIcon fontSize="small" /> },
    { label: "AI- Sentiment", icon: <SentimentSatisfiedAltOutlinedIcon fontSize="small" /> },
    { label: "Ai View", icon: <VisibilityOutlinedIcon fontSize="small" /> },
    { label: "NEWS", icon: <NewspaperOutlinedIcon fontSize="small" /> },
    { label: "Peer Deals Performance", icon: <InsightsOutlinedIcon fontSize="small" /> },
  ];

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!payload) {
    return (
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            No details available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please go back and select a deal card.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Chip
              icon={<ArrowBackIcon />}
              label="Back"
              onClick={() => navigate(-1)}
              sx={{ cursor: "pointer" }}
            />
          </Box>
        </Paper>
      </Container>
    );
  }

  const activePayload = selectedOption || payload;
  const isIpo = (activePayload.deal_type || "").toLowerCase().includes("ipo");

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          background: "linear-gradient(180deg, #ffffff 0%, #f5f8ff 100%)",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
        }}
      >

        <Paper
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 3,
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack spacing={0.6}>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                    Ticker: {activePayload.ticker || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                    Company: {activePayload.company_name || activePayload.issuer_name || "N/A"}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                    Pricing Date: {formatDate(activePayload.pricing_date)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                    Deal Type: {activePayload.deal_type || "N/A"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                    Region: {activePayload.region || activePayload.country || "N/A"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                    Sector: {activePayload.sector || activePayload.sectors || "N/A"}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <NewDashboardLifeCycleTickerSearch
                selectedTicker={activePayload.ticker}
                onSelect={setSelectedOption}
              />
            </Grid>
          </Grid>
        </Paper>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 3,
            "& .MuiTabs-indicator": {
              backgroundColor: "#3b2a7a",
              height: 3,
              borderRadius: 999,
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              color: "#475569",
              minHeight: 44,
              px: 2,
            },
            "& .Mui-selected": {
              color: "#3b2a7a",
            },
          }}
        >
          {tabItems.map((item) => (
            <Tab
              key={item.label}
              icon={item.icon}
              iconPosition="start"
              label={item.label}
              sx={{
                borderRadius: 999,
                backgroundColor: "#f1f5ff",
                mr: 1,
                "&.Mui-selected": {
                  backgroundColor: "#e0e7ff",
                },
              }}
            />
          ))}
        </Tabs>

        <Box sx={{ mb: 3 }}>
          {tabItems[tabValue]?.label === "Write up" ? (
            isIpo ? (
              <WriteUpIPODashbaord ticker={activePayload.ticker} />
            ) : (
              <FOWriteUpDashboardMain ticker={activePayload.ticker} />
            )
          ) : (
            <PageUnderDevelopment />
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default NewDashboardLifeCycleDetails;
