import React from "react";
import { Tabs, Tab, Box, useTheme, useMediaQuery } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const pages = [
  "New Deal Data",
  "Machine Learning",
  "Equity Market Opportunity",
  "Monashee Performance & Efficiency",
  "PRIME Investment Strategies",
  "Portfolio Attribution",
];

const EquityNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md")); // small screens

  const handleNavigate = (page: string) => {
    switch (page) {
      case "New Deal Data":
        navigate("/equity/issue_market");
        break;
      case "Machine Learning":
        navigate("/equity/ml_equity");
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
      case "/equity/ml_equity":
        return 1;
      case "/equity/capital-markets":
      case "/equity/capital-markets/":
      case "/equity/capital-markets/deal-stats":
      case "/equity/capital-markets/skew-table":
      case "/equity/capital-markets/deal-filter":
        return 2;
      case "/equity/monashee-deals":
      case "/equity/monashee-deals/":
      case "/equity/monashee-deals/deal-stats":
      case "/equity/monashee-deals/screener":
      case "/equity/monashee-deals/by-bank":
      case "/equity/monashee-deals/weekly-tracking":
      case "/equity/monashee-deals/follow-on-discount":
      case "/equity/monashee-deals/gap-analysis":
        return 3;
      case "/equity/strategies":
        return 4;
      case "/equity/portfolio-attribution":
        return 5;
      default:
        return false;
    }
  };

  return (
<Box sx={{ width: "100%" }}>
  <Tabs
    value={getTabIndex()}
    variant="fullWidth"
    TabIndicatorProps={{ style: { display: "none" } }} // Hides the default indicator
    sx={{
      "& .MuiTab-root": {
        fontSize: isSmall ? "12px" : "14px",
        padding: isSmall ? "6px" : "10px",
        textTransform: "none",
        fontWeight: "bold",
        whiteSpace: "normal", // Allow text to wrap inside the tab
        lineHeight: 1.2,
        minHeight: "48px",
        color: "#bb4401", // Default color for the tabs
        transition: "background-color 0.3s ease, color 0.3s ease", // Smooth transition for hover/active states
      },
      "& .Mui-selected": {
        backgroundColor: "#002060", // Background color for the selected tab
        color: "#FFFFFF !important", // Text color for the selected tab
        border: "2px solid #FFFFFF", // You can adjust the border size here
      },
    }}
  >
    {pages.map((page, index) => (
      <Tab
        key={page}
        label={page}
        onClick={() => handleNavigate(page)}
        sx={{
          mx: 0.5,
          borderRadius: "6px",
          "&:hover": {
            backgroundColor: "#002060", // Change background color on hover
            color: "#FFFFFF", // Ensure the text turns white on hover
          },
        }}
      />
    ))}
  </Tabs>
</Box>

  );
};

export default EquityNavbar;
