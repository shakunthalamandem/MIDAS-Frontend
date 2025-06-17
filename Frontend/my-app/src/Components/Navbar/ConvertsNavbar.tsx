import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const pages = [
  "Converts Market Opportunity",
  "Monashee Performance & Efficiency",
  "Portfolio Attribution",
];

const ConvertsNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (page: string) => {
    switch (page) {
      case "Converts Market Opportunity":
        navigate("/opportunity/converts");
        break;
      case "Monashee Performance & Efficiency":
        navigate("/machine_learning/converts");
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

      case "/opportunity/converts":
      case "/opportunity/converts/":
      case "/opportunity/converts/deal-stats":
      case "/opportunity/converts/skew-table":
      case "/opportunity/converts/deal-filter":
        return 0;
      case "/machine_learning/converts":
      case "/machine_learning/converts/":
      case "/machine_learning/converts/deal-stats":
      case "/machine_learning/converts/screener":
      case "/machine_learning/converts/by-bank":
      case "/machine_learning/converts/weekly-tracking":
      case "/machine_learning/converts/follow-on-discount":
      case "/machine_learning/converts/gap-analysis":
        return 1;

      case "/converts/portfolio-attribution":
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

export default ConvertsNavbar;
