import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Badge,
} from "@mui/material";
import { useNavigate, useLocation, Link } from "react-router-dom";
import NotificationMenu from "./NotificationMenu";
import logo from "../../Assets/images/Monashee-Cap-Logos.png";
import TradingViewTickerTape from "../Main/InvestmentStrategy/Tradingview/TradingViewTickerTape";
import Logs from "../Main/HomePage/Authentication/Logs";
import Logout from "../Main/HomePage/Authentication/Logout";
import DropdownTab from "./DropdownTab";
import ChatBoxButton from "../Main/HomePage/Authentication/ChatBoxButton";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import InsightsIcon from "@mui/icons-material/Insights";
import PsychologyIcon from "@mui/icons-material/Psychology";
import HubIcon from "@mui/icons-material/Hub";
import AppsIcon from "@mui/icons-material/Apps";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import PostAddOutlinedIcon from "@mui/icons-material/PostAddOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import EqualizerOutlinedIcon from "@mui/icons-material/EqualizerOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import PieChartOutlineIcon from "@mui/icons-material/PieChartOutline";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

const NavbarMain: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedTab, setSelectedTab] = useState<string>(
    () => localStorage.getItem("selectedTab") || ""
  );

  const isSuperUser = localStorage.getItem("is_superuser") === "true";
  const [showLogs, setShowLogs] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [loading, setLoading] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const refresh_token = localStorage.getItem("refresh_token");
  const user = localStorage.getItem("user");

  useEffect(() => {
    if (selectedTab) {
      localStorage.setItem("selectedTab", selectedTab);
    }
  }, [selectedTab]);

  useEffect(() => {
    if (location.pathname === "/") {
      setSelectedTab("");
      localStorage.removeItem("selectedTab");
    }
  }, [location.pathname]);

  const navigateAndRefresh = (path: string) => {
    navigate(path);
    // Hard reload to prevent stale cached data when switching tabs
    setTimeout(() => window.location.reload(), 0);
  };

  const handleTabSelect = (tabName: string) => {
    setSelectedTab(tabName);
    localStorage.setItem("selectedTab", tabName);

    switch (tabName) {
      case "P&L Attribution":
        navigateAndRefresh("/portfolio-attribution");
        break;
      case "Data & Analytics":
        navigateAndRefresh("/data-analytics/writeups");
        break;
      // case "New Deal Form":
      //   navigate("/deals/new_deal_form");
      //   break;
      default:
        break;
    }
  };

  const handleNewDashboardClick = () => {
    setSelectedTab("New Dashboard");
    localStorage.setItem("selectedTab", "New Dashboard");
    setNewDashboardDefaults("US");
    navigateAndRefresh("/deals/new_dashboard");
  };

  const handleLogoutClick = () => {
    setShowLogout(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await fetch(`${apiUrl}/api/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ refresh_token: refresh_token, user: user }),
      });

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("selectedTab");

      setLoading(false);
      navigate("/login");
    } catch (error) {
      setLoading(false);
      console.error("Logout failed:", error);
    }
    setShowLogout(false);
  };

  const handleCancelLogout = () => {
    setShowLogout(false);
  };

  const isLoggedIn = !!localStorage.getItem("access_token");

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleLogoutClick();
    handleMenuClose();
  };

  const setNewDashboardDefaults = (region: "US" | "APAC" | "EMEA") => {
    localStorage.setItem("newDashboardSelectedRegion", region);
    localStorage.setItem("newDashboardSelectedDealType", "IPO");
    localStorage.setItem("newDashboardSelectedOp", "upcoming");
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{ backgroundColor: "#FFFFFF", zIndex: 1200 }}
      >
        {(location.pathname === "/macro/prime" ||
          location.pathname.startsWith("/equity/technical/")) && (
            <Box sx={{ marginBottom: "50px" }}>
              <TradingViewTickerTape />
            </Box>
          )}

        <Box
          sx={{
            backgroundColor: "#002060",
            color: "#fff",
            padding: "5px 0",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              "& .marquee": {
                display: "inline-block",
                whiteSpace: "nowrap",
                animation: "marquee 40s linear infinite",
                color: "#fff",
                fontWeight: "bold",
                fontStyle: "italic",
                paddingLeft: "10px",
                paddingRight: "50px",
              },
              "@keyframes marquee": {
                "0%": { transform: "translateX(100%)" },
                "100%": { transform: "translateX(-100%)" },
              },
              "& .marquee:hover": {
                animationPlayState: "paused",
              },
            }}
          >
            <span className="marquee">
              MIDAS is for internal usage only. All Data and Analytics are
              Confidential
            </span>
          </Typography>
        </Box>

        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <img
              src={logo}
              alt="MIDAS Logo"
              style={{ width: "130px", height: "60px", marginLeft: "10px" }}
            />
          </Link>

          <Box sx={{ flexGrow: 1, textAlign: "center" }}>
            <Button
              onClick={handleNewDashboardClick}
              sx={{
                color: "#005166",
                fontWeight: "bold",
                fontSize: "0.725rem",
                mx: 1,
                borderBottom:
                  selectedTab === "New Dashboard"
                    ? "3px solid #005166"
                    : "3px solid transparent",
                borderRadius: 0,
                "&:hover": {
                  borderBottom: "3px solid #005166",
                  backgroundColor: "transparent",
                },
              }}
            >
              New Dashboard
            </Button>
            <DropdownTab
              label="AI-ML"
              menuItems={[
                {
                  label: "US IPO & FO AI-ML Model",
                  path: "/equity/ai_ml_models",
                  icon: <AutoAwesomeIcon fontSize="small" />,
                },
                // {
                //   label: "APAC IPO & FO AI-ML Model",
                //   path: "/equity/apac_ai_ml_models",
                //   icon: <AutoAwesomeIcon fontSize="small" />,
                // },
                {
                  label: "AI-ML Result Dashboard",
                  path: "/equity/ai_ml_results",
                  icon: <InsightsIcon fontSize="small" />,
                },
                // {
                //   label: "AI Portfolio Review",
                //   path: "/ai_portfolio_review",
                //   icon: <PsychologyIcon fontSize="small" />,
                //   reload: false,
                // },
                //       {
                //   label: "Last 30 Days IPO AI Ranking",
                //   path: "/last_30_days_ai_ranking",
                //   icon: <AutoAwesomeIcon fontSize="small" />,
                // },
                // {
                //   label: "ABB Model",
                //   path: "/equity/abb_model",
                //   icon: <HubIcon fontSize="small" />,
                // },
                // {
                //   label: "Gen AI Tool",
                //   path: "/gen_ai_tool",
                //   icon: <PsychologyIcon fontSize="small" />,
                // },
                // {
                //   label: "AI Few-Shot Analysis",
                //   path: "/ai_fewshot_analysis",
                //   icon: <AppsIcon fontSize="small" />,
                // },
                // { label: "Portfolio Sentiment ", path: "/genai_data_set" },
                // { label: "Portfolio  News", path: "/macro/news-summary" },
              ]}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              rich
            />
            <Button
              onClick={() => {
                setSelectedTab("AI-Agent Dashboard");
                localStorage.setItem("selectedTab", "AI-Agent Dashboard");
                navigate("/agents/dashboard");
              }}
              sx={{
                color: "#005166",
                fontWeight: "bold",
                fontSize: "0.725rem",
                mx: 1,
                borderBottom:
                  selectedTab === "AI-Agent Dashboard"
                    ? "3px solid #005166"
                    : "3px solid transparent",
                borderRadius: 0,
                "&:hover": {
                  borderBottom: "3px solid #005166",
                  backgroundColor: "transparent",
                },
              }}
            >
              AI-Agents
              <span
                style={{
                  fontSize: "0.55rem",
                  marginLeft: "4px",
                  verticalAlign: "super",
                  color: "#ff1e00",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}
              >
                Beta
              </span>
            </Button>
            {/* 
            <DropdownTab
              label="AI-Agents"
              menuItems={[

               {
                  label: "AI-Agent Dashboard",
                  path: "/agents/dashboard",
                  icon: <InsightsIcon fontSize="small" />,
                },
               
                // {
                //   label: "AI Portfolio Review",
                //   path: "/ai_portfolio_review",
                //   icon: <PsychologyIcon fontSize="small" />,
                //   reload: false,
                // },
                // {
                //   label: "AI based on previous 30 deals",
                //   path: "/ai_fewshot_analysis",
                //   icon: <DescriptionOutlinedIcon fontSize="small" />,
                // },
                // {
                //   label: "AI View (Outside Sentiment)",
                //   path: "/ai_sentiment_view",
                //   icon: <InsightsIcon fontSize="small" />,
                // },
                //  {
                //   label: "AI-ML Result Dashboard",
                //   path: "/equity/ai_ml_results",
                //   icon: <InsightsIcon fontSize="small" />,
                // },
                // {
                //   label: "Last 30 Days IPO AI Ranking",
                //   path: "/last_30_days_ai_ranking",
                //   icon: <AutoAwesomeIcon fontSize="small" />,
                // },
                
              ]}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              rich
            /> */}
            <DropdownTab
              label="Profit & Loss"
              menuItems={[
                {
                  label: "Risk and P&L Attribution ",
                  path: "/risk_report_pnl_report",
                  icon: <AssessmentOutlinedIcon fontSize="small" />,
                },
                {
                  label: "Risk Triggers",
                  path: "/risk_triggers",
                  icon: <WarningAmberOutlinedIcon fontSize="small" />,
                },
                {
                  label: "Daily Note to Funds",
                  path: "/portfolio-attribution/pnlfunddeatils",
                  icon: <DescriptionOutlinedIcon fontSize="small" />,
                },
                {
                  label: "Monashee Daily Report",
                  path: "/opportunity/monashee_daily_report",
                  icon: <SummarizeOutlinedIcon fontSize="small" />,
                },
                {
                  label: "Previous Report",
                  path: "/portfolio-attribution/pnl_risk_report",
                  icon: <HistoryOutlinedIcon fontSize="small" />,
                  children: [
                    {
                      label: "Risk Report to Funds",
                      path: "/portfolio-attribution/pnl_risk_report",
                    },
                    {
                      label: "P&L Attribution",
                      path: "/portfolio-attribution",
                    },
                  ],
                },
              ]}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              rich
            />

            <DropdownTab
              label="Opportunity & Performance"
              menuItems={[
                {
                  label: "Summary Dashboard",
                  path: "/opportunity/summary",
                  icon: <GridViewOutlinedIcon fontSize="small" />,
                },
                {
                  label: "Equity Market Opportunity",
                  path: "/opportunity/equity",
                  icon: <ShowChartOutlinedIcon fontSize="small" />,
                },
                // {
                //   label: "Past IPOs & FOs",
                //   path: "/opportunity/pastdeals",
                //   icon: <HistoryEduOutlinedIcon fontSize="small" />,
                // },
                // {
                //   label: "Monashee Daily Report",
                //   path: "/opportunity/monashee_daily_report",
                //   icon: <SummarizeOutlinedIcon fontSize="small" />,
                // },
                {
                  label: "High Yields Market Opportunity",
                  path: "/opportunity/high-yield",
                  icon: <EqualizerOutlinedIcon fontSize="small" />,
                },
                {
                  label: "Converts Market Opportunity",
                  path: "/opportunity/converts",
                  icon: <AutorenewOutlinedIcon fontSize="small" />,
                },
              ]}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              rich
            />

            <DropdownTab
              label="Macro (Prime)"
              menuItems={[
                {
                  label: "Prime",
                  path: "/macro/prime",
                  icon: <PublicOutlinedIcon fontSize="small" />,
                },
                // { label: "News Summary", path: "/macro/news-summary" },
                {
                  label: "Sector",
                  path: "/macro/sector",
                  icon: <PieChartOutlineIcon fontSize="small" />,
                },
                {
                  label: "AI News",
                  path: "/macro/news-summary",
                  icon: <AutoStoriesOutlinedIcon fontSize="small" />,
                },
                {
                  label: "Data & Analytics",
                  path: "/data-analytics/writeups",
                  icon: <DescriptionOutlinedIcon fontSize="small" />,
                },
              ]}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              rich
            />


            {/* <Button
              onClick={() => handleTabSelect("Data & Analytics")}
              sx={{
                color: "#005166",
                fontWeight: "bold",
                fontSize: "0.725rem",
                mx: 1,
                borderBottom:
                  selectedTab === "Data & Analytics"
                    ? "3px solid #005166"
                    : "3px solid transparent",
                borderRadius: 0,
                "&:hover": {
                  borderBottom: "3px solid #005166",
                  backgroundColor: "transparent",
                },
              }}
            >
              Data & Analytics
            </Button> */}
          </Box>

          {/* Right Side */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              marginRight: "10px",
            }}
          >
            {isLoggedIn && (
              <>
                {/* 🔔 Notifications */}
                <ChatBoxButton
                  label="New Deal Form"
                  icon={<PostAddOutlinedIcon fontSize="small" />}
                  onClick={() => navigate("/deals/new_deal_form")}
                />
                {/* <ChatBoxButton /> */}
                <ChatBoxButton
                  label="Meeting Notes"
                  icon={<HistoryEduOutlinedIcon fontSize="small" />}
                  onClick={() => navigate("/deal_meeting_notes")}
                />

                {/* <NotificationMenu /> */}
              </>
            )}

            {isLoggedIn && isSuperUser && (
              <Button
                sx={{ color: "#000", fontWeight: "bold", marginRight: "20px" }}
                onClick={() => setShowLogs(true)}
              >
                <Logs />
              </Button>
            )}

            {isLoggedIn ? (
              <>
                <Tooltip title="Open Profile Menu">
                  <IconButton onClick={handleProfileClick} sx={{ p: 0 }}>
                    <Avatar sx={{ bgcolor: "#005166" }}>
                      {user?.charAt(0).toUpperCase() || "P"}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  PaperProps={{ elevation: 3, sx: { mt: 1.5 } }}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem disableRipple>
                    <Box
                      onClick={handleLogout}
                      sx={{
                        width: "100%",
                        color: "#002060",
                        padding: "4px 0px",
                        borderRadius: "3px",
                        textAlign: "center",
                        "&:hover": {
                          backgroundColor: "#005166",
                          color: "#FFFFFF",
                        },
                      }}
                    >
                      Logout
                    </Box>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                sx={{
                  color: "#FFFFFF",
                  backgroundColor: "#002060",
                  fontWeight: "bold",
                  px: "18px",
                }}
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {showLogout && (
        <Logout onConfirm={handleConfirmLogout} onCancel={handleCancelLogout} />
      )}
    </>
  );
};

export default NavbarMain;
