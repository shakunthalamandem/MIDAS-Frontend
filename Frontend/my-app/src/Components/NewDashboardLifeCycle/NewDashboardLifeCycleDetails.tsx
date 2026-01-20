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
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FindInPageOutlinedIcon from "@mui/icons-material/FindInPageOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import NewspaperOutlinedIcon from "@mui/icons-material/NewspaperOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import { formatDate, formatDealSize, formatPriceValue } from "./NewDashboardLifeCycleUtils";

const NewDashboardLifeCycleDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const payload = (location.state as { payload?: any } | null)?.payload;
  const [tabValue, setTabValue] = React.useState(0);

  const tabItems = [
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
    navigate("/page_under_development");
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

  const title = payload.ticker || payload.company || "Deal Details";
  const subtitle = payload.issuer_name || payload.company_name || payload.company || "";

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          background: "linear-gradient(180deg, #ffffff 0%, #f5f8ff 100%)",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Chip
            icon={<ArrowBackIcon />}
            label="Back"
            onClick={() => navigate(-1)}
            sx={{ cursor: "pointer", fontWeight: 600 }}
          />
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0b1844" }}>
            {title}
          </Typography>
          {payload.deal_type && (
            <Chip
              label={String(payload.deal_type).toUpperCase()}
              sx={{ bgcolor: "#e0f2fe", color: "#0b3d91", fontWeight: 600 }}
            />
          )}
          {payload.deal_status && (
            <Chip
              label={String(payload.deal_status)}
              sx={{ bgcolor: "#ecfccb", color: "#3f6212", fontWeight: 600 }}
            />
          )}
        </Stack>

        {subtitle && (
          <Typography variant="body1" sx={{ color: "#475569", fontWeight: 500, mb: 3 }}>
            {subtitle}
          </Typography>
        )}

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

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: 3, backgroundColor: "#f8fafc" }}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  Deal Snapshot
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarMonthOutlinedIcon fontSize="small" />
                  <Typography variant="body2">
                    Pricing Date: {formatDate(payload.pricing_date)}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarMonthOutlinedIcon fontSize="small" />
                  <Typography variant="body2">
                    Trade Date: {formatDate(payload.trade_date)}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PaidOutlinedIcon fontSize="small" />
                  <Typography variant="body2">
                    Deal Size: {formatDealSize(payload.deal_size)}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocalOfferOutlinedIcon fontSize="small" />
                  <Typography variant="body2">Price: {formatPriceValue(payload)}</Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: 3, backgroundColor: "#f8fafc" }}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  Classification
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <BusinessOutlinedIcon fontSize="small" />
                  <Typography variant="body2">
                    Region: {payload.region || payload.country || "N/A"}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CategoryOutlinedIcon fontSize="small" />
                  <Typography variant="body2">
                    Sector: {payload.sector || payload.sectors || "N/A"}
                  </Typography>
                </Stack>
                {payload.exchange && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BusinessOutlinedIcon fontSize="small" />
                    <Typography variant="body2">Exchange: {payload.exchange}</Typography>
                  </Stack>
                )}
                {payload.fo_type && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BusinessOutlinedIcon fontSize="small" />
                    <Typography variant="body2">FO Type: {payload.fo_type}</Typography>
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>
            Raw Payload
          </Typography>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "#0f172a",
              color: "#e2e8f0",
              fontFamily: "Consolas, Menlo, Monaco, monospace",
              fontSize: "0.85rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {JSON.stringify(payload, null, 2)}
          </Paper>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewDashboardLifeCycleDetails;
