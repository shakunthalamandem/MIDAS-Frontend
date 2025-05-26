import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useNavigate, useLocation } from "react-router-dom";

const EquityNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  // Dropdown menus state
  const [anchorElOp, setAnchorElOp] = useState<null | HTMLElement>(null);
  const [anchorElPrime, setAnchorElPrime] = useState<null | HTMLElement>(null);

  const handleNavigate = (path: string) => {
    navigate(path);
    setAnchorElOp(null);
    setAnchorElPrime(null);
  };

  const isActivePath = (basePath: string) => {
    return location.pathname.startsWith(basePath);
  };

  const getTabIndex = () => {
    const path = location.pathname;

    if (path.startsWith("/equity/capital-markets")) return 0;
    if (path.startsWith("/equity/monashee-deals")) return 0;
    if (path.startsWith("/equity/detailed_gap_analysis")) return 0;

    if (path === "/equity/issue_market") return 1;
    if (path === "/equity/create_form") return 1;

    if (path === "/equity/ml_equity") return 2;

    if (
      path === "/equity/strategies" ||
      path === "/macro/news" ||
      path === "/macro/sector"
    )
      return 3;

    return false;
  };

  const renderDropdownLabel = (label: string) => (
    <Box display="flex" alignItems="center" gap={0.5}>
      {label}
      <ArrowDropDownIcon fontSize="small" />
    </Box>
  );

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <Tabs
        value={getTabIndex()}
        TabIndicatorProps={{ style: { display: "none" } }}
        sx={{
          display: "flex",
          justifyContent: "center",
          "& .MuiTabs-flexContainer": {
            gap: 1,
          },
          "& .MuiTab-root": {
            fontSize: isSmall ? "12px" : "14px",
            padding: isSmall ? "6px" : "10px",
            textTransform: "none",
            fontWeight: "bold",
            whiteSpace: "normal",
            lineHeight: 1,
            minHeight: "48px",
            color: "#bb4401",
            transition: "background-color 0.3s ease, color 0.3s ease",
            borderRadius: "6px",
            "&:hover": {
              backgroundColor: "#002060",
              color: "#FFFFFF",
            },
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
          label={renderDropdownLabel("Opportunity & Performance")}
          onMouseEnter={(e) => setAnchorElOp(e.currentTarget)}
          onMouseLeave={() =>
            setTimeout(() => {
              if (!document.getElementById("op-menu")?.matches(":hover")) {
                setAnchorElOp(null);
              }
            }, 200)
          }
        />

        {/* Tab: New Deal Form */}
        <Tab
          label="New Deal Form"
          onClick={() => handleNavigate("/equity/issue_market")}
        />

        {/* Tab: AI Model */}
        <Tab
          label="AI Model"
          onClick={() => handleNavigate("/equity/ml_equity")}
        />

        {/* Dropdown: PRIME */}
        <Tab
          label={renderDropdownLabel("PRIME")}
          onMouseEnter={(e) => setAnchorElPrime(e.currentTarget)}
          onMouseLeave={() =>
            setTimeout(() => {
              if (!document.getElementById("prime-menu")?.matches(":hover")) {
                setAnchorElPrime(null);
              }
            }, 200)
          }
        />
      </Tabs>

      {/* Menu for Opportunity & Performance */}
      <Menu
        id="op-menu"
        anchorEl={anchorElOp}
        open={Boolean(anchorElOp)}
        onClose={() => setAnchorElOp(null)}
        MenuListProps={{
          onMouseLeave: () => setAnchorElOp(null),
        }}
      >
        <MenuItem
          onClick={() => handleNavigate("/equity/capital-markets")}
          selected={isActivePath("/equity/capital-markets")}
          sx={
            isActivePath("/equity/capital-markets")
              ? { fontWeight: "bold", backgroundColor: "#e3f2fd" }
              : {}
          }
        >
          Equity Market Opportunity
        </MenuItem>

        <MenuItem
          onClick={() => handleNavigate("/equity/monashee-deals")}
          selected={isActivePath("/equity/monashee-deals")}
          sx={
            isActivePath("/equity/monashee-deals")
              ? { fontWeight: "bold", backgroundColor: "#e3f2fd" }
              : {}
          }
        >
          Monashee Performance & Efficiency
        </MenuItem>
      </Menu>

      {/* Menu for PRIME */}
      <Menu
        id="prime-menu"
        anchorEl={anchorElPrime}
        open={Boolean(anchorElPrime)}
        onClose={() => setAnchorElPrime(null)}
        MenuListProps={{
          onMouseLeave: () => setAnchorElPrime(null),
        }}
      >
        <MenuItem
          onClick={() => handleNavigate("/equity/strategies")}
          selected={isActivePath("/equity/strategies")}
          sx={
            isActivePath("/equity/strategies")
              ? { fontWeight: "bold", backgroundColor: "#e3f2fd" }
              : {}
          }
        >
          PRIME Investment Strategies
        </MenuItem>
        <MenuItem
          onClick={() => handleNavigate("/macro/news")}
          selected={isActivePath("/macro/news")}
          sx={
            isActivePath("/macro/news")
              ? { fontWeight: "bold", backgroundColor: "#e3f2fd" }
              : {}
          }
        >
          News
        </MenuItem>
        <MenuItem
          onClick={() => handleNavigate("/macro/sector")}
          selected={isActivePath("/macro/sector")}
          sx={
            isActivePath("/macro/sector")
              ? { fontWeight: "bold", backgroundColor: "#e3f2fd" }
              : {}
          }
        >
          Sector Comparison
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default EquityNavbar;
