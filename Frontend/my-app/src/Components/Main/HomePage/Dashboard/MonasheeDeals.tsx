import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Tabs, Tab, TextField, InputAdornment, List, ListItem, ListItemText, CircularProgress, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MDDScreener from "../../MonasheeDeals/MddGraphs/MDDScreener";
import AllocationCaptureReturn from "../../MonasheeDeals/MddGraphs/AllocationCaptureReturn";
import FOllowOnDiscount from "../../MonasheeDeals/MddGraphs/FOllowOnDiscount";
import DealStats from "../../MonasheeDeals/MddGraphs/DealStats";
import MDDSelectedTicker from "../../MonasheeDeals/MddGraphs/MDDSelectedTicker";
import WeeklyStatsChart from "../../MonasheeDeals/MDDSettings/WeeklyStatsChart";
import ByBankTable from "../../MonasheeDeals/MddGraphs/ByBankTable";

// Define the type for the API response
interface MDDResult {
  ticker: string;
  issuer_name: string;
}

const MonasheeDeals: React.FC = () => {
  const { ticker: routeTicker } = useParams<{ ticker: string }>(); // Get ticker from the route parameters
  const navigate = useNavigate(); // Initialize the navigate function for routing
  const [value, setValue] = useState(0); // For controlling tab selectiony
  const [searchTerm, setSearchTerm] = useState<string>(""); // Search term state
  const [results, setResults] = useState<MDDResult[]>([]); // Search results
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [selectedTicker, setSelectedTicker] = useState<string>(routeTicker || "CRGX"); // Default selected ticker from URL or fallback

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  useEffect(() => {
    const path = window.location.pathname.split("/").pop();
    switch (path) {
      case "deal-stats":
        setValue(1);
        break;
      case "gap-analysis":
        setValue(2);
        break;
      case "follow-on-discount":
        setValue(3);
        break;
      case "weekly-tracking":
        setValue(4);
        break;
      case "by-bank":
        setValue(5);
        break;
      case "screener":
        setValue(6);
        break;
      default:
        setValue(0);
        break;
    }
  }, [window.location.pathname]);
  // Handle change for tab selection
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);

    // Map the selected tab index to the URL path
    const tabPaths = [
      " ",
      "deal-stats",
      "gap-analysis",
      "follow-on-discount",
      "weekly-tracking",
      "by-bank",
      "screener"
    ];

    // Update the URL based on the tab index
    navigate(`/equity/monashee-deals/${tabPaths[newValue]}`);
  };

  // Handle search input and fetching results
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length < 2) {
      setResults([]); // Clear results if query is too short
      return;
    }

    setLoading(true); // Set loading to true during fetch
    try {
      const response = await fetch(`${apiUrl}/api/mdd_search/${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      const data: MDDResult[] = await response.json();
      setResults(data); // Set the fetched results
    } catch (error) {
      console.error("Error fetching search results:", error);
      // navigate("/error");  
      setResults([]); // Clear results on error
    } finally {
      setLoading(false); // Set loading to false once fetch is done
    }
  };

  // Handle selecting an item from the search results list
  const handleItemClick = (ticker: string) => {
    setSelectedTicker(ticker); // Set selected ticker
    setSearchTerm(""); // Clear the search term
    setResults([]); // Clear the results
  };

  useEffect(() => {
    if (routeTicker) {
      setSelectedTicker(routeTicker); // Set selected ticker when URL param changes
    }
  }, [routeTicker]);

  return (
    <Box sx={{ width: "100%", backgroundColor: "#fff" }}>
      {/* Heading */}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: "#FFFFFF",
          fontSize: { xs: "1rem", sm: "1.2rem" },
          backgroundColor: "#002060",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "4vh",
          padding: "8px 16px",
          borderRadius: "8px",
          textAlign: "center",
          marginBottom: "20px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          animation: "fadeIn 2s ease-out",
          "@keyframes fadeIn": {
            "0%": { opacity: 0, transform: "translateY(-10px)" },
            "100%": { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        Welcome to Monashee Participated Deals Dashboard! Explore valuable insights into the deals you've actively participated in across the global market.
      </Typography>

      {/* Tabs */}
      <Tabs
        value={value}
        onChange={handleChange}
        centered
        TabIndicatorProps={{
          style: { display: "none" },
        }}
        sx={{
          display: "flex",
          justifyContent: "center",
          margin: "10px 0",
          "& .MuiTab-root": {
            backgroundColor: "#E3E6F0",
            color: "#002060",
            borderRadius: "12px",
            padding: "10px 20px",
            fontSize: "0.9rem",
            maxHeight: "50px",
            fontWeight: "600",
            margin: "0 5px",
            textTransform: "none",
            transition: "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
            "&:hover": {
              backgroundColor: "#DCE6F0",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            },
          },
          "& .Mui-selected": {
            backgroundColor: "#FF8C00",
            color: "#ffffff !important",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
       <Tab sx={{ backgroundColor: value === 0 ? "#dce6f0" : "#f5f5f5", color: value === 0 ? "#fff" : "#777", "&.Mui-selected": { backgroundColor: "#dce6f0", color: "#fff" } }}
          label={
            <Box sx={{ width: "100%", maxHeight: "45px", maxWidth: "200px"}}>
              <TextField
                label=""
                variant="outlined"
                value={searchTerm}
                autoComplete="off"
                onChange={handleSearch}
                placeholder="Enter ticker..."
                style={{
                  marginBottom: "1px",
                  width: "200px",
                  height: "40px",
                  borderRadius: "32px",
                  backgroundColor: "#f4f6f9",
                }}
                InputProps={{
                  style: {
                    borderRadius: "42px",
                    width: "200px",
                    height: "40px",
                  },
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#656565" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          }
        />
        <Tab label="Deal Stats" />
        <Tab label="GAP Analysis" />
        <Tab label="Follow-On Discount" />
        <Tab label="Weekly Tracking" />
        <Tab label="By Bank" />
        <Tab label="Screener" />
      </Tabs>

      {/* Search results displayed outside the tabs */}
      {searchTerm.length > 0 && (
        <Box sx={{ marginBottom: "20px", display: "flex", marginLeft: "500px" }}>
          {loading ? (
            <CircularProgress />
          ) : (
            <Paper
              elevation={3}
              style={{
                padding: "10px",
                maxWidth: "280px",
                maxHeight: "300px",
                overflowY: "auto",
                backgroundColor: "#ffffff",
                borderRadius: "8px",
              }}
            >
              {results.length === 0 ? (
                <Typography variant="body2" color="textSecondary" align="center">
                  No results found.
                </Typography>
              ) : (
                <List>
                  {results.map((item, index) => (
                    <ListItem
                      key={index}
                      onClick={() => handleItemClick(item.ticker)} // Set selected ticker
                      component="li"
                      style={{
                        backgroundColor:
                          selectedTicker === item.ticker
                            ? "rgba(63, 81, 181, 0.1)"
                            : "transparent",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f0f0f0")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          selectedTicker === item.ticker
                            ? "rgba(63, 81, 181, 0.1)"
                            : "transparent")
                      }
                    >
                      <ListItemText
                        primary={<strong>{item.ticker}</strong>}
                        secondary={item.issuer_name}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          )}
        </Box>
      )}

      {/* Tab Content */}
      {value === 0 && selectedTicker && <MDDSelectedTicker ticker={selectedTicker} />}
      {value === 1 && <DealStats />}
      {value === 2 && <AllocationCaptureReturn />}
      {value === 3 && <FOllowOnDiscount />}
      {value === 4 && <WeeklyStatsChart />}
      {value === 5 && <ByBankTable />}
      {value === 6 && <MDDScreener />}
    </Box>
  );
};

export default MonasheeDeals;
