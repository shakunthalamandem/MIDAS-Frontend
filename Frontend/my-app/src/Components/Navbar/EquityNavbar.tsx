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

  const [anchorElOp, setAnchorElOp] = useState<null | HTMLElement>(null);
  const [anchorElPrime, setAnchorElPrime] = useState<null | HTMLElement>(null);
  const [anchorElDeals, setAnchorElDeals] = useState<null | HTMLElement>(null);

  const handleNavigate = (path: string) => {
    navigate(path);
    setAnchorElOp(null);
    setAnchorElPrime(null);
    setAnchorElDeals(null);
  };

  const isActivePath = (basePath: string) => {
    return location.pathname.startsWith(basePath);
  };

  const getTabIndex = () => {
    const path = location.pathname;

    if (
      path.startsWith("/opportunity/equity") ||
      path.startsWith("/opportunity/summary") ||
      path.startsWith("/equity/monashee-deals") ||
      path.startsWith("/equity/detailed_gap_analysis")
    )
      return 0;

    if (
      path === "/deals/new_deal_form" ||
      path === "/equity/create_form" ||
      path === "/equity/ipo_dashboard" ||
      path === "/deals/dashboard"
    )
      return 1;

    if (path === "/machine_learning/equity") return 2;

    if (
      path === "/macro/prime" ||
      path === "/macro/news-summary" ||
      path === "/macro/sector"
    )
      return 3;

    if (path === "/data-analytics/writeups") return 4;

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
        {/* Opportunity & Performance Dropdown */}
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

        {/* Current Deals Dropdown */}
        <Tab
          label={renderDropdownLabel("Current Deals")}
          onMouseEnter={(e) => setAnchorElDeals(e.currentTarget)}
          onMouseLeave={() =>
            setTimeout(() => {
              if (!document.getElementById("deals-menu")?.matches(":hover")) {
                setAnchorElDeals(null);
              }
            }, 200)
          }
        />

        {/* AI Model */}
        <Tab
          label="AI Model"
          onClick={() => {
            sessionStorage.removeItem("selected_form_data");
            sessionStorage.removeItem("auto_predict");
            handleNavigate("/machine_learning/equity");
          }}
        />

        {/* PRIME Dropdown */}
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

        {/* NEW TAB: Writeups & Analytics */}
        <Tab
          label="Writeups & Analytics"
          onClick={() => handleNavigate("/data-analytics/writeups")}
        />
      </Tabs>

      {/* Menu: Opportunity & Performance */}
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
          onClick={() => handleNavigate("/opportunity/summary")}
          selected={isActivePath("/opportunity/summary")}
          sx={
            isActivePath("/opportunity/summary")
              ? { fontWeight: "bold", backgroundColor: "#e3f2fd" }
              : {}
          }
        >
          Summary Dashboard
        </MenuItem>
        <MenuItem
          onClick={() => handleNavigate("/opportunity/equity")}
          selected={isActivePath("/opportunity/equity")}
          sx={
            isActivePath("/opportunity/equity")
              ? { fontWeight: "bold", backgroundColor: "#e3f2fd" }
              : {}
          }
        >
      Market Opportunity 
        </MenuItem>
        {/* <MenuItem
          onClick={() => handleNavigate("/equity/monashee-deals")}
          selected={isActivePath("/equity/monashee-deals")}
          sx={
            isActivePath("/equity/monashee-deals")
              ? { fontWeight: "bold", backgroundColor: "#e3f2fd" }
              : {}
          }
        >
          Monashee Performance & Efficiency (MDD)
        </MenuItem> */}
      </Menu>

      {/* Menu: Current Deals */}
      <Menu
        id="deals-menu"
        anchorEl={anchorElDeals}
        open={Boolean(anchorElDeals)}
        onClose={() => setAnchorElDeals(null)}
        MenuListProps={{
          onMouseLeave: () => setAnchorElDeals(null),
        }}
      >
         <MenuItem
          onClick={() => handleNavigate("/deals/dashboard")}
          selected={isActivePath("/deals/dashboard")}
          sx={
            isActivePath("/deals/dashboard")
              ? { fontWeight: "bold", backgroundColor: "#e3f2fd" }
              : {}
          }
        >
          Dashboard
        </MenuItem>
        <MenuItem
          onClick={() => handleNavigate("/deals/new_deal_form")}
          selected={isActivePath("/deals/new_deal_form")}
          sx={
            isActivePath("/deals/new_deal_form")
              ? { fontWeight: "bold", backgroundColor: "#e3f2fd" }
              : {}
          }
        >
          New Deal Form
        </MenuItem>
         {/* <MenuItem
          onClick={() => handleNavigate("/equity/ipo_dashboard")}
          selected={isActivePath("/equity/ipo_dashboard")}
          sx={
            isActivePath("/equity/ipo_dashboard")
              ? { fontWeight: "bold", backgroundColor: "#e3f2fd" }
              : {}
          }
        > IPO Dashboard
        </MenuItem> */}
       
      </Menu>

      {/* Menu: PRIME */}
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
          onClick={() => handleNavigate("/macro/prime")}
          selected={isActivePath("/macro/prime")}
          sx={
            isActivePath("/macro/prime")
              ? { fontWeight: "bold", backgroundColor: "#e3f2fd" }
              : {}
          }
        >
          PRIME Investment Strategies
        </MenuItem>
        <MenuItem
          onClick={() => handleNavigate("/macro/news-summary")}
          selected={isActivePath("/macro/news-summary")}
          sx={
            isActivePath("/macro/news-summary")
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
