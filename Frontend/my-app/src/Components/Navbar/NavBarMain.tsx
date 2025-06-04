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
  Container,
} from "@mui/material";
import { useNavigate, useLocation, Link } from "react-router-dom";
import logo from "../../Assets/images/Monashee-Cap-Logos.png";
import TradingViewTickerTape from "../Main/InvestmentStrategy/Tradingview/TradingViewTickerTape";
import Logs from "../Main/HomePage/Authentication/Logs";
import Logout from "../Main/HomePage/Authentication/Logout";
import EquityNavbar from "./EquityNavbar";
import ConvertsNavbar from "./ConvertsNavbar";
import HighYieldNavbar from "./HighYieldNavbar";
import MacroNavbar from "./MacroNavbar";

const NavbarMain: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedTab, setSelectedTab] = useState<string>(() => {
    return localStorage.getItem("selectedTab") || "Equity";
  });

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
    localStorage.setItem("selectedTab", selectedTab);
  }, [selectedTab]);

  const handleTabSelect = (tabName: string) => {
    setSelectedTab(tabName);
    localStorage.setItem("selectedTab", tabName);

    switch (tabName) {
      case "Equity":
        navigate("/equity/dashboard");
        break;
      case "Converts":
        navigate("/converts/capital-markets");
        break;
      case "High Yield":
        navigate("/highyield/capital-markets");
        break;
      case "Portfolio Attribution":
        navigate("/portfolio-attribution");
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
      localStorage.removeItem("selectedTab"); // Clear tab on logout

      setLoading(false);
      navigate("/login");
    } catch (error) {
      setLoading(false);
      console.error("Logout failed:", error);
    }
    setShowLogout(false);
  };

  const handleCancelLogout = () => {
    setShowLogout(false); // Cancel logout confirmation
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
        {(location.pathname === "/equity/strategies" ||
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
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img
              src={logo}
              alt="MIDAS Logo"
              style={{ width: "130px", height: "60px", marginLeft: "10px" }}
            />
          </Link>

          {/* Tabs Centered */}
          <Box sx={{ flexGrow: 1, textAlign: "center" }}>
            {["Equity", "Converts", "High Yield", "Portfolio Attribution"].map((tab) => (
              <Button
                key={tab}
                onClick={() => handleTabSelect(tab)}
                sx={{
                  color: selectedTab === tab ? "#FFFFFF" : "#bb4401",
                  backgroundColor: selectedTab === tab ? "#bb4401" : "transparent",
                  fontWeight: "bold",
                  mx: 1,
                  "&:hover": {
                    backgroundColor: "#bb4401",
                    color: "#FFFFFF",
                  },
                }}
              >
                {tab}
              </Button>
            ))}
          </Box>

          {/* Profile + Logs */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginRight: "10px" }}>
            {isLoggedIn && isSuperUser && (
              <Button sx={{ color: "#000", fontWeight: "bold", marginRight: "20px"}} onClick={() => setShowLogs(true)}>
                <Logs />
              </Button>
            )}

            {isLoggedIn ? (
              <>
                <Tooltip title="Open Profile Menu">
                  <IconButton onClick={handleProfileClick} sx={{ p: 0 }}>
                    <Avatar sx={{ bgcolor: "#bb4401" }}>
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
                        backgroundColor: "#bb4401",
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

      {/* Subnavbar BELOW AppBar */}
      <Box sx={{ width: "100%", backgroundColor: "#f3f3f3", padding: "10px 0" }}>
        {selectedTab === "Equity" && <EquityNavbar />}
        {selectedTab === "Converts" && <ConvertsNavbar />}
        {selectedTab === "High Yield" && <HighYieldNavbar />}
        {selectedTab === "Portfolio Attribution" && <MacroNavbar />}
      </Box>

      {/* Logout Confirmation Dialog */}
      {showLogout && <Logout onConfirm={handleConfirmLogout} onCancel={handleCancelLogout} />}
    </>
  );
};

export default NavbarMain;
