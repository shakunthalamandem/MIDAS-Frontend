import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const pages = [
  "Equity Market Opportunity",
  "Monashee Performance & Efficiency",
  "Portfolio Attribution",
];

const HighYield: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (page: string) => {
    switch (page) {
      case "Equity Market Opportunity":
        navigate("/capital-markets");
        break;
      case "Monashee Performance & Efficiency":
        navigate("/monashee-deals");
        break;
      case "Portfolio Attribution":
        navigate("/portfolio-attribution");
        break;
      default:
        break;
    }
  };

  const getTabIndex = () => {
    switch (location.pathname) {
      case "/issue_market":
        return 0;
      case "/capital-markets":
      case "/capital-markets/":
      case "/capital-markets/deal-stats":
      case "/capital-markets/skew-table":
      case "/capital-markets/deal-filter":
        return 1;
      case "/monashee-deals":
      case "/monashee-deals/":
      case "/monashee-deals/deal-stats":
      case "/monashee-deals/screener":
      case "/monashee-deals/by-bank":
      case "/monashee-deals/weekly-tracking":
      case "/monashee-deals/follow-on-discount":
      case "/monashee-deals/gap-analysis":
        return 2;
      case "/strategies":
        return 3;
      case "/portfolio-attribution":
        return 4;
      default:
        return false;
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

export default HighYield;
