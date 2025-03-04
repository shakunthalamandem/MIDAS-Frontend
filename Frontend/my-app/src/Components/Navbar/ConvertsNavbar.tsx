import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const pages = [
  "Equity Market Opportunity",
  "Monashee Performance & Efficiency",
  "Portfolio Attribution",
];

const ConvertsNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (page: string) => {
    switch (page) {
      case "Equity Market Opportunity":
        navigate("/converts/capital-markets");
        break;
      case "Monashee Performance & Efficiency":
        navigate("/converts/monashee-deals");
        break;
      case "Portfolio Attribution":
        navigate("/converts/portfolio-attribution");
        break;
      default:
        break;
    }
  };

  const getTabIndex = () => {
    switch (location.pathname) {

      case "/converts/capital-markets":
      case "/converts/capital-markets/":
      case "/converts/capital-markets/deal-stats":
      case "/converts/capital-markets/skew-table":
      case "/converts/capital-markets/deal-filter":
        return 0;
      case "/converts/monashee-deals":
      case "/converts/monashee-deals/":
      case "/converts/monashee-deals/deal-stats":
      case "/converts/monashee-deals/screener":
      case "/converts/monashee-deals/by-bank":
      case "/converts/monashee-deals/weekly-tracking":
      case "/converts/monashee-deals/follow-on-discount":
      case "/converts/monashee-deals/gap-analysis":
        return 1;

      case "/converts/portfolio-attribution":
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

export default ConvertsNavbar;
