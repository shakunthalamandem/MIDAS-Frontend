import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const pages = [
 

  // "Sector Comparison",
  // "News",
  // "Monashee Performance & Efficiency",
  // "Upload Market Indices",
  "Portfolio Attribution",
];

const MacroNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (page: string) => {
    switch (page) {
      case "Portfolio Attribution":
        navigate("/portfolio-attribution");
        break;
      case "Sector Comparison":
        navigate("/macro/sector");
        break;
      case "News":
        navigate("/macro/news-summary");
        break;
      case "Monashee Performance & Efficiency":
        navigate("/macro/monashee-deals");
        break;

      default:
        break;
    }
  };

  const getTabIndex = () => {
    switch (location.pathname) {
      case "/portfolio-attribution":
      case "/macro/capital-markets/":
      case "/macro/capital-markets/deal-stats":
      case "/macro/capital-markets/skew-table":
      case "/macro/capital-markets/deal-filter":
        return 0;
      case "/macro/news-summary":
          return 1;
      case "/macro/monashee-deals":
      case "/macro/monashee-deals/":
      case "/macro/monashee-deals/deal-stats":
      case "/macro/monashee-deals/screener":
      case "/macro/monashee-deals/by-bank":
      case "/macro/monashee-deals/weekly-tracking":
      case "/macro/monashee-deals/follow-on-discount":
      case "/macro/monashee-deals/gap-analysis":
        return 2;
      case "/":
        return 3;
      default:
        return 3;
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

export default MacroNavbar;
