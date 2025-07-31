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
} from "@mui/material";
import { useNavigate, useLocation, Link } from "react-router-dom";
import logo from "../../Assets/images/Monashee-Cap-Logos.png";
import TradingViewTickerTape from "../Main/InvestmentStrategy/Tradingview/TradingViewTickerTape";
import Logs from "../Main/HomePage/Authentication/Logs";
import Logout from "../Main/HomePage/Authentication/Logout";
import DropdownTab from "./DropdownTab";

const NavbarMain: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedTab, setSelectedTab] = useState<string>(() => localStorage.getItem("selectedTab") || "");

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

  const handleTabSelect = (tabName: string) => {
    setSelectedTab(tabName);
    localStorage.setItem("selectedTab", tabName);

    switch (tabName) {
      case "P&L Attribution":
        navigate("/portfolio-attribution");
        break;
      case "Data & Analytics":
        navigate("/data-analytics/writeups");
        break;
      case "New Deal Form":
        navigate("/deals/new_deal_form");
        break;
      default:
        break;
    }
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

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: "#FFFFFF", zIndex: 1200 }}>
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
              MIDAS is for internal usage only. All Data and Analytics are Confidential
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
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img
              src={logo}
              alt="MIDAS Logo"
              style={{ width: "130px", height: "60px", marginLeft: "10px" }}
            />
          </Link>

          <Box sx={{ flexGrow: 1, textAlign: "center" }}>
                  <DropdownTab
              label="AI-ML"
              menuItems={[
                { label: "Gen AI Tool", path: "/gen_ai_tool" },
                { label: "Portfolio Sentiment ", path: "/genai_data_set" },
                { label: "US FO ML Model", path: "/machine_learning/equity" },
                { label: "IPO Write-up", path: "/equity/ipo_dashboard" },
                {label: "Portfolio  News", path: "/macro/news-summary" },
                // { label: "High Yields", path: "/machine_learning/high-yield" },
                // { label: "Converts", path: "/machine_learning/converts" },
              ]}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
          

            {/* <DropdownTab
              label="New Deals (IPO)"
              menuItems={[
                { label: "Dashboard", path: "/deals/dashboard" },
                { label: "New Deal Form", path: "/deals/new_deal_form" },
              ]}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            /> */}

             <Button
              onClick={() => handleTabSelect("New Deal Form")}
              sx={{
                color: "#005166",
                fontWeight: "bold",
                fontSize: "0.725rem",
                mx: 1,
                borderBottom:
                  selectedTab === "New Deal Form" ? "3px solid #005166" : "3px solid transparent",
                borderRadius: 0,
                "&:hover": {
                  borderBottom: "3px solid #005166",
                  backgroundColor: "transparent",
                },
              }}
            >
              New Deal Form
            </Button>

              <Button
              onClick={() => handleTabSelect("P&L Attribution")}
              sx={{
                color: "#005166",
                fontWeight: "bold",
                fontSize: "0.725rem",
                mx: 1,
                borderBottom:
                  selectedTab === "P&L Attribution" ? "3px solid #005166" : "3px solid transparent",
                borderRadius: 0,
                "&:hover": {
                  borderBottom: "3px solid #005166",
                  backgroundColor: "transparent",
                },
              }}
            >
              P&L Attribution
            </Button>

      

            <DropdownTab
              label="Opportunity & Performance"
              menuItems={[
                { label: "Summary Dashboard", path: "/opportunity/summary" },
                { label: "Equity Market Opportunity", path: "/opportunity/equity" },
                { label: "High Yields Market Opportunity", path: "/opportunity/high-yield" },
                { label: "Converts Market Opportunity", path: "/opportunity/converts" },
              ]}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />

            <DropdownTab
              label="Macro (Prime)"
              menuItems={[
                { label: "Prime", path: "/macro/prime" },
                { label: "News Summary", path: "/macro/news-summary" },
                { label: "Sector", path: "/macro/sector" },
              ]}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />

            <Button
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
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginRight: "10px" }}>
            {isLoggedIn && isSuperUser && (
              <Button sx={{ color: "#000", fontWeight: "bold", marginRight: "20px" }} onClick={() => setShowLogs(true)}>
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
                        '&:hover': {
                          backgroundColor: "#005166",
                          color: "#FFFFFF",
                        }
                      }}
                    >
                      Logout
                    </Box>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button sx={{ color: "#FFFFFF", backgroundColor: "#002060", fontWeight: "bold", paddingX: "18px" }} onClick={() => navigate("/login")}>
                Login
              </Button>
            )}
            {showLogout && <Logout onConfirm={handleConfirmLogout} onCancel={handleCancelLogout} />}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Subnavbar could be conditionally rendered here if needed */}

      {/* Logout Confirmation Dialog */}
      {showLogout && <Logout onConfirm={handleConfirmLogout} onCancel={handleCancelLogout} />}
    </>
  );
};

export default NavbarMain;