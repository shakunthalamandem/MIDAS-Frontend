import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const pages = [
  "Equity Market Opportunity",
  "Monashee Performance & Efficiency",
  "Portfolio Attribution",
];

const HighYieldNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (page: string) => {
    switch (page) {
      case "Equity Market Opportunity":
        navigate("/highyield/capital-markets");
        break;
      case "Monashee Performance & Efficiency":
        navigate("/highyield/monashee-deals");
        break;
      case "Portfolio Attribution":
        navigate("/highyield/portfolio-attribution");
        break;
      default:
        break;
    }
  };

  const getTabIndex = () => {
    switch (location.pathname) {
       case "/highyield/capital-markets":
       case "/highyield/capital-markets/":
       case "/highyield/capital-markets/deal-stats":
       case "/highyield/capital-markets/skew-table":
       case "/highyield/capital-markets/deal-filter":
        return 0;
       case "/highyield/monashee-deals":
       case "/highyield/monashee-deals/":
       case "/highyield/monashee-deals/deal-stats":
       case "/highyield/monashee-deals/screener":
       case "/highyield/monashee-deals/by-bank":
       case "/highyield/monashee-deals/weekly-tracking":
       case "/highyield/monashee-deals/follow-on-discount":
       case "/highyield/monashee-deals/gap-analysis":
        return 1;
       case "/highyield/portfolio-attribution":
        return 2;
      default:
        return 0;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
      <Tabs
        value={getTabIndex()}
        sx={{
          "& .MuiTabs-indicator": {
            backgroundColor: "#002060",
            display: "none",
          },
        }}
      >
        {pages.map((page, index) => (
          <Tab
            key={page}
            label={page}
            onClick={() => handleNavigate(page)}
            sx={{
              minWidth: 100,
              fontWeight: "bold",
              fontSize: "16px",
              color: getTabIndex() === index ? "#FFFFFF" : "#bb4401",
              backgroundColor: getTabIndex() === index ? "#002060" : "transparent",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#002060",
                borderRadius: "6px",
                color: "#FFFFFF",
              },
              "&.Mui-selected": {
                backgroundColor: "#002060",
                color: "#FFFFFF",
                borderRadius: "6px",
              },
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default HighYieldNavbar;
