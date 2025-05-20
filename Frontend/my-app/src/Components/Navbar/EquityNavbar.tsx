import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const EquityNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  // Dropdown menus state
  const [anchorElOp, setAnchorElOp] = useState<null | HTMLElement>(null);
  const [anchorElPrime, setAnchorElPrime] = useState<null | HTMLElement>(null);

  const handleMenuClick = (setter: any) => (event: React.MouseEvent<HTMLElement>) => {
    setter(event.currentTarget);
  };

  const handleMenuClose = (setter: any) => () => {
    setter(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setAnchorElOp(null);
    setAnchorElPrime(null);
  };

  const getTabIndex = () => {
    switch (location.pathname) {
      case "/equity/issue_market":
        return 1;
      case "/equity/ml_equity":
        return 2;
      default:
        return false;
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={getTabIndex()}
        variant="fullWidth"
        TabIndicatorProps={{ style: { display: "none" } }}
        sx={{
          "& .MuiTab-root": {
            fontSize: isSmall ? "12px" : "14px",
            // padding: isSmall ? "6px" : "10px",
            textTransform: "none",
            fontWeight: "bold",
            whiteSpace: "normal",
            lineHeight: 1.2,
            minHeight: "48px",
            color: "#bb4401",
            transition: "background-color 0.3s ease, color 0.3s ease",
          },
          "& .Mui-selected": {
            backgroundColor: "#002060",
            color: "#FFFFFF !important",
            border: "2px solid #FFFFFF",
          },
        }}
      >
        {/* Dropdown: Opportunity & Performance */}
        <Tab
          label="Opportunity & Performance"
          onClick={handleMenuClick(setAnchorElOp)}
          sx={{
            mx: 0.5,
            borderRadius: "6px",
            "&:hover": {
              backgroundColor: "#002060",
              color: "#FFFFFF",
            },
          }}
        />
        {/* Tab: New Deal Form */}
        <Tab
          label="New Deal Form"
          onClick={() => handleNavigate("/equity/issue_market")}
          sx={{
            mx: 0.5,
            borderRadius: "6px",
            "&:hover": {
              backgroundColor: "#002060",
              color: "#FFFFFF",
            },
          }}
        />
        {/* Tab: AI Model */}
        <Tab
          label="AI Model"
          onClick={() => handleNavigate("/equity/ml_equity")}
          sx={{
            mx: 0.5,
            borderRadius: "6px",
            "&:hover": {
              backgroundColor: "#002060",
              color: "#FFFFFF",
            },
          }}
        />
        {/* Dropdown: PRIME */}
        <Tab
          label="PRIME"
          onClick={handleMenuClick(setAnchorElPrime)}
          sx={{
            mx: 0.5,
            borderRadius: "6px",
            "&:hover": {
              backgroundColor: "#002060",
              color: "#FFFFFF",
            },
          }}
        />
      </Tabs>

      {/* Menu for Opportunity & Performance */}
      <Menu
        anchorEl={anchorElOp}
        open={Boolean(anchorElOp)}
        onClose={handleMenuClose(setAnchorElOp)}
      >
        <MenuItem onClick={() => handleNavigate("/equity/capital-markets")}>
          Equity Market Opportunity
        </MenuItem>
        <MenuItem onClick={() => handleNavigate("/equity/monashee-deals")}>
          Monashee Performance & Efficiency
        </MenuItem>
      </Menu>

      {/* Menu for PRIME */}
      <Menu
        anchorEl={anchorElPrime}
        open={Boolean(anchorElPrime)}
        onClose={handleMenuClose(setAnchorElPrime)}
      >
        <MenuItem onClick={() => handleNavigate("/equity/strategies")}>
          PRIME Investment Strategies
        </MenuItem>
        <MenuItem onClick={() => handleNavigate("/macro/news")}>News</MenuItem>
        <MenuItem onClick={() => handleNavigate("/macro/sector")}>Sector Comparison</MenuItem>
      </Menu>
    </Box>
  );
};

export default EquityNavbar;
