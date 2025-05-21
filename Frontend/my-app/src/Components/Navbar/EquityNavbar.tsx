import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate, useLocation } from "react-router-dom";

const EquityNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

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
  const path = location.pathname;

  if (
    path === "/equity/capital-markets" ||
    path === "/equity/monashee-deals"
  ) {
    return 0; // Opportunity & Performance
  }

  if (path === "/equity/issue_market") {
    return 1; // New Deal Form
  }

  if (path === "/equity/ml_equity") {
    return 2; // AI Model
  }

  if (
    path === "/equity/strategies" ||
    path === "/macro/news" ||
    path === "/macro/sector"
  ) {
    return 3; // PRIME
  }

  return false;
};


  const renderDropdownLabel = (label: string) => (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Typography fontWeight="bold">{label}</Typography>
      <ExpandMoreIcon fontSize="small" />
    </Box>
  );

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <Tabs
        value={getTabIndex()}
        TabIndicatorProps={{ style: { display: "none" } }}
        sx={{
          "& .MuiTabs-flexContainer": {
            justifyContent: "center",
            gap: 1,
          },
          "& .MuiTab-root": {
            fontSize: isSmall ? "12px" : "14px",
            padding: isSmall ? "6px 12px" : "10px 20px",
            textTransform: "none",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            minHeight: "48px",
            borderRadius: "6px",
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
        <Tab
          label={renderDropdownLabel("Opportunity & Performance")}
          onClick={handleMenuClick(setAnchorElOp)}
        />
        <Tab
          label="New Deal Form"
          onClick={() => handleNavigate("/equity/issue_market")}
        />
        <Tab
          label="AI Model"
          onClick={() => handleNavigate("/equity/ml_equity")}
        />
        <Tab
          label={renderDropdownLabel("PRIME")}
          onClick={handleMenuClick(setAnchorElPrime)}
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
        <MenuItem onClick={() => handleNavigate("/macro/news")}>
          News
        </MenuItem>
        <MenuItem onClick={() => handleNavigate("/macro/sector")}>
          Sector Comparison
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default EquityNavbar;
