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
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
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
import NewDashboardLifeCycleOverview from "./NewDashboardLifeCycleOverview";
import NewDashboardLifeCycleOverviewFO from "./NewDashboardLifeCycleOverviewFO";

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
            background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
            border: "1px solid #e2e8f0",
            boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack spacing={0.6}>
                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                  <Chip
                    icon={<ArrowBackIcon />}
                    label="Back"
                    onClick={() => navigate("/deals/new_dashboard")}
                    sx={{ cursor: "pointer", fontWeight: 600 }}
                  />
                  <Chip
                    label={activePayload.ticker || "N/A"}
                    sx={{
                      bgcolor: "#e2e8f0",
                      color: "#0f172a",
                      fontWeight: 700,
                    }}
                  />
                  <Chip
                    label={activePayload.company_name || activePayload.issuer_name || "N/A"}
                    sx={{
                      bgcolor: "#eef2ff",
                      color: "#1d4ed8",
                      fontWeight: 600,
                    }}
                  />
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                  <Chip
                    label={formatDate(activePayload.pricing_date)}
                    icon={<CalendarMonthOutlinedIcon fontSize="small" />}
                    sx={{ bgcolor: "#f8fafc", color: "#475569", fontWeight: 600 }}
                  />
                  <Chip
                    label={activePayload.deal_type || "N/A"}
                    icon={<LocalOfferOutlinedIcon fontSize="small" />}
                    sx={{ bgcolor: "#f0fdf4", color: "#166534", fontWeight: 600 }}
                  />
                  <Chip
                    label={activePayload.region || activePayload.country || "N/A"}
                    icon={<BusinessOutlinedIcon fontSize="small" />}
                    sx={{ bgcolor: "#ecfeff", color: "#0f766e", fontWeight: 600 }}
                  />
                  <Chip
                    label={activePayload.sector || activePayload.sectors || "N/A"}
                    icon={<CategoryOutlinedIcon fontSize="small" />}
                    sx={{ bgcolor: "#fdf4ff", color: "#7c3aed", fontWeight: 600 }}
                  />
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
            backgroundColor: "#ffffff",
            borderRadius: 999,
            p: 0.5,
            boxShadow: "0 6px 16px rgba(15, 23, 42, 0.08)",
            border: "1px solid #e2e8f0",
            "& .MuiTabs-indicator": {
              display: "none",
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              color: "#64748b",
              minHeight: 44,
              px: 2,
              borderRadius: 999,
            },
            "& .Mui-selected": {
              color: "#ffffff",
              backgroundColor: "#2f6fed",
              boxShadow: "0 6px 12px rgba(47, 111, 237, 0.28)",
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
          {tabItems[tabValue]?.label === "Overview" ? (
            isIpo ? (
              <NewDashboardLifeCycleOverview
                ticker={activePayload.ticker}
                pricingDate={activePayload.pricing_date}
                dealType={activePayload.deal_type}
              />
            ) : (
              <NewDashboardLifeCycleOverviewFO
                ticker={activePayload.ticker}
                pricingDate={activePayload.pricing_date}
              />
            )
          ) : tabItems[tabValue]?.label === "Write up" ? (
            isIpo ? (
              <WriteUpIPODashbaord ticker={activePayload.ticker} />
            ) : (
              <FOWriteUpDashboardMain
                ticker={activePayload.ticker}
                deal_id={activePayload.deal_id}
              />
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
