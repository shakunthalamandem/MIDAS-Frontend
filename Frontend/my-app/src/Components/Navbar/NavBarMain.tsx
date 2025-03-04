import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { useNavigate, useLocation, Link } from "react-router-dom";
import logo from "../../Assets/images/Monashee-Cap-Logos.png";
import TradingViewTickerTape from "../Main/InvestmentStrategy/Tradingview/TradingViewTickerTape";
import Logs from "../Main/HomePage/Authentication/Logs";
import Logout from "../Main/HomePage/Authentication/Logout";
import NavbarTabs from "./NavbarTabs";
import Sidebar from "./Sidebar";

const NavbarMain: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperUser = localStorage.getItem("is_superuser") === "true";
  const [showLogs, setShowLogs] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNavbarTabs, setShowNavbarTabs] = useState(false); // State to show NavbarTabs
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const refresh_token = localStorage.getItem("refresh_token");
  const user = localStorage.getItem("user");

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

  const isMarketOrPerformanceSelected =
    location.pathname === "/equity/capital-markets" ||
    location.pathname === "/equity/monashee-deals" ||
    location.pathname === "/equity/portfolio-attribution" ||
    location.pathname === "/equity/issue_market";

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: "#FFFFFF" }}>
        {(location.pathname === "/equity/strategies" ||
          location.pathname.startsWith("/equity/technical/")) && (
          <Box sx={{ marginBottom: "50px" }}>
            <TradingViewTickerTape />
          </Box>
        )}

        {isMarketOrPerformanceSelected && (
          <Box
            sx={{
              width: "100%",
              backgroundColor: "#002060",
              color: "#fff",
              padding: "5px 0",
              textAlign: "center",
              fontWeight: "bold",
              position: "sticky",
              top: 0,
              zIndex: 1100,
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
        )}

        <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img src={logo} alt="MIDAS Logo" style={{ width: "130px", height: "60px", marginRight: "10px" }} />
          </Link>

          {/* Pass function to Sidebar */}
          {/* <Sidebar onEquityClick={() => setShowNavbarTabs(true)} /> */}
            <NavbarTabs />

          {isLoggedIn && isSuperUser && (
            <Button sx={{ color: "black", fontWeight: "bold", marginRight: "20px" }} onClick={() => setShowLogs(true)}>
              <Logs />
            </Button>
          )}

          {isLoggedIn ? (
            <Button sx={{ color: "#FFFFFF", backgroundColor: "#bb4401", fontWeight: "bold" }} onClick={handleLogoutClick}>
              Logout
            </Button>
          ) : (
            <Button sx={{ color: "#FFFFFF", backgroundColor: "#002060", fontWeight: "bold" }} onClick={() => navigate("/login")}>
              Login
            </Button>
          )}

          {showLogout && <Logout onConfirm={handleConfirmLogout} onCancel={handleCancelLogout} />}
        </Toolbar>
      </AppBar>

      {/* Conditionally Show NavbarTabs */}
      {/* {showNavbarTabs && (
        <Box sx={{ marginLeft: "240px", padding: "20px" }}>
          <NavbarTabs />
        </Box>
      )} */}
    </>
  );
};

export default NavbarMain;
