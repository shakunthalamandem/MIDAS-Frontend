import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const pages = [
  "New Deal Data",
  "Equity Market Opportunity",
  "Monashee Performance & Efficiency",
  "PRIME Investment Strategies",
  "Portfolio Attribution",
];

const EquityNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (page: string) => {
    switch (page) {
      case "New Deal Data":
        navigate("/equity/issue_market");
        break;
      case "Equity Market Opportunity":
        navigate("/equity/capital-markets");
        break;
      case "Monashee Performance & Efficiency":
        navigate("/equity/monashee-deals");
        break;
      case "PRIME Investment Strategies":
        navigate("/equity/strategies");
        break;
      case "Portfolio Attribution":
        navigate("/equity/portfolio-attribution");
        break;
      default:
        break;
    }
  };

  const getTabIndex = () => {
    switch (location.pathname) {
      case "/equity/issue_market":
        return 0;
      case "/equity/capital-markets":
      case "/equity/capital-markets/":
      case "/equity/capital-markets/deal-stats":
      case "/equity/capital-markets/skew-table":
      case "/equity/capital-markets/deal-filter":
        return 1;
      case "/equity/monashee-deals":
      case "/equity/monashee-deals/":
      case "/equity/monashee-deals/deal-stats":
      case "/equity/monashee-deals/screener":
      case "/equity/monashee-deals/by-bank":
      case "/equity/monashee-deals/weekly-tracking":
      case "/equity/monashee-deals/follow-on-discount":
      case "/equity/monashee-deals/gap-analysis":
        return 2;
      case "/equity/strategies":
        return 3;
      case "/equity/portfolio-attribution":
        return 4;
      case "/":
          return 5;
      default:
        return 5;
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

export default EquityNavbar;
