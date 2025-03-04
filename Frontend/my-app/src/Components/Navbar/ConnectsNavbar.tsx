import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const pages = [
  "Equity Market Opportunity",
  "Monashee Performance & Efficiency",
  "Portfolio Attribution",
];

const ConnectsNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (page: string) => {
    switch (page) {
      case "Equity Market Opportunity":
        navigate("/connects/capital-markets");
        break;
      case "Monashee Performance & Efficiency":
        navigate("/connects/monashee-deals");
        break;
      case "Portfolio Attribution":
        navigate("/connects/portfolio-attribution");
        break;
      default:
        break;
    }
  };

  const getTabIndex = () => {
    switch (location.pathname) {

      case "/connects/capital-markets":
      case "/connects/capital-markets/":
      case "/connects/capital-markets/deal-stats":
      case "/connects/capital-markets/skew-table":
      case "/connects/capital-markets/deal-filter":
        return 0;
      case "/connects/monashee-deals":
      case "/connects/monashee-deals/":
      case "/connects/monashee-deals/deal-stats":
      case "/connects/monashee-deals/screener":
      case "/connects/monashee-deals/by-bank":
      case "/connects/monashee-deals/weekly-tracking":
      case "/connects/monashee-deals/follow-on-discount":
      case "/connects/monashee-deals/gap-analysis":
        return 1;

      case "/connects/portfolio-attribution":
        return 2;
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

export default ConnectsNavbar;
