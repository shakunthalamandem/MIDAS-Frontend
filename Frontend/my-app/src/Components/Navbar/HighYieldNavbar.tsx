import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const pages = [
  "High Yield Market Opportunity",
  "Monashee Performance & Efficiency",
  "Portfolio Attribution",
];

const HighYieldNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (page: string) => {
    switch (page) {
      case "High Yield Market Opportunity":
        navigate("/opportunity/high-yield");
        break;
      case "Monashee Performance & Efficiency":
        navigate("/machine_learning/high-yield");
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
       case "/opportunity/high-yield":
       case "/opportunity/high-yield/":
       case "/opportunity/high-yield/deal-stats":
       case "/opportunity/high-yield/skew-table":
       case "/opportunity/high-yield/deal-filter":
        return 0;
       case "/machine_learning/high-yield":
       case "/machine_learning/high-yield/":
       case "/machine_learning/high-yield/deal-stats":
       case "/machine_learning/high-yield/screener":
       case "/machine_learning/high-yield/by-bank":
       case "/machine_learning/high-yield/weekly-tracking":
       case "/machine_learning/high-yield/follow-on-discount":
       case "/machine_learning/high-yield/gap-analysis":
        return 1;
       case "/highyield/portfolio-attribution":
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

export default HighYieldNavbar;
