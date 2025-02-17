import React, { useState } from 'react';
import { AppBar, Toolbar, Tabs, Tab, Button, Box, Typography } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import logo from '../../Assets/images/Monashee-Cap-Logos.png';
import TradingViewTickerTape from '../Main/InvestmentStrategy/Tradingview/TradingViewTickerTape';
import Logs from '../Main/HomePage/Authentication/Logs';
import Logout from '../Main/HomePage/Authentication/Logout';
const pages = ['Equity Market Opportunity', 'Monashee Performance & Efficiency', 'PRIME Investment Strategies'];

const NavbarMain: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const [openLogsDialog, setOpenLogsDialog] = useState(false);
  const isSuperUser = localStorage.getItem('is_superuser') === 'true';
  const [showLogs, setShowLogs] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const refresh_token = localStorage.getItem("refresh_token");
  const user = localStorage.getItem("user");

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
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
            "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ refresh_token: refresh_token, user: user })
    });    

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user")

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

  const handleNavigate = (page: string) => {
    if (page === "Equity Market Opportunity") navigate("/capital-markets");
    if (page === "Monashee Performance & Efficiency")
      navigate("/monashee-deals");
    if (page === "PRIME Investment Strategies") navigate("/strategies");
    handleCloseNavMenu();
  };



  const getTabIndex = () => {
    switch (location.pathname) {
      case "/capital-markets":
        return 0;
      case "/monashee-deals":
        return 1;
      case "/strategies":
        return 2;
      default:
        return false;
    }
  };

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setLoading(false);
      setOpenDialog(false);
      navigate("/login");
    }, 1500); // Simulate API delay
  };

  const isLoggedIn = !!localStorage.getItem("access_token");

  const isMarketOrPerformanceSelected =
    location.pathname === "/capital-markets" ||
    location.pathname === "/monashee-deals";

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: "#FFFFFF" }}>
        {(location.pathname === "/strategies" ||
          location.pathname.startsWith("/technical/")) && (
          <Box sx={{ marginBottom: "50px" }}>
            <TradingViewTickerTape />
          </Box>
        )}

        {/* Scrollbar container */}
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
              zIndex: 1100, // Ensure it stays on top of the navbar
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
        )}

        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo and Title */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "#FFFFFF",
            }}
          >
            <img
              src={logo}
              alt="MIDAS Logo"
              style={{ width: "130px", height: "60px", marginRight: "10px" }}
            />
          </Link>

          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Tabs
              value={getTabIndex()}
              sx={{
                "& .MuiTabs-indicator": {
                  backgroundColor: "#002060",
                  display: "none", // Set the custom indicator color here
                },
              }}
            >
              {pages.map((page) => (
                <Tab
                  key={page}
                  label={page}
                  onClick={() => handleNavigate(page)}
                  sx={{
                    minWidth: 100,
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "#bb4401",
                    textTransform: "none",
                    "&.Mui-selected": {
                      color: "#FFFFFF",
                      backgroundColor: "#002060",
                      borderRadius: "6px",
                    },
                    "&:hover": {
                      backgroundColor: "#002060",
                      borderRadius: "6px",
                      color: "#FFFFFF",
                    },
                  }}
                />
              ))}
            </Tabs>
          </Box>
          {isLoggedIn && isSuperUser && (
            <>
              <Button
                sx={{
                  color: 'black',
                  fontWeight: 'bold',
                  marginRight: '20px',
                }}
                onClick={() => setShowLogs(true)}
              >

                <div>
                  <Logs />

                </div>          </Button>


            </>
          )}



          <>
            {isLoggedIn ? (
              <Button
                sx={{
                  color: '#FFFFFF',
                  backgroundColor: '#bb4401',
                  fontWeight: 'bold',
                  fontFamily: 'Roboto, sans-serif',
                  height: 30,
                  '&:hover': { backgroundColor: '#bb4401' },
                }}
                onClick={handleLogoutClick}  // Show Logout component when clicked
              >
                Logout
              </Button>
            ) : (
              <Button
                sx={{
                  color: '#FFFFFF',
                  backgroundColor: '#002060',
                  fontWeight: 'bold',
                  fontFamily: 'Roboto, sans-serif',
                  '&:hover': { backgroundColor: '#002060' },
                }}
                onClick={() => navigate('/login')}  // Navigate to the login page
              >
                Login
              </Button>
            )}


          </>
          {/* {showLogout && <Logout />}  */}
          {showLogout && (
            <Logout
              onConfirm={handleConfirmLogout}
              onCancel={handleCancelLogout}
            />)}
        </Toolbar>
      </AppBar>


    </>
  );
};

export default NavbarMain;
