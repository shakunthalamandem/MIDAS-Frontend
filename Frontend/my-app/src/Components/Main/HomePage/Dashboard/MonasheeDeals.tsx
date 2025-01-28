import React, { useState } from "react";
import { Box, Typography, Tabs, Tab, TextField, InputAdornment, List, ListItem, ListItemText, CircularProgress, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MDDScreener from "../../MonasheeDeals/MddGraphs/MDDScreener";
import AllocationCaptureReturn from "../../MonasheeDeals/MddGraphs/AllocationCaptureReturn";
import FOllowOnDiscount from "../../MonasheeDeals/MddGraphs/FOllowOnDiscount";
import MDDDealSearch from "../../MonasheeDeals/MddGraphs/MDDDealSearch";
import DealStats from "../../MonasheeDeals/MddGraphs/DealStats";
import MDDSelectedTicker from "../../MonasheeDeals/MddGraphs/MDDSelectedTicker";
// Define the type for the API response 
interface MDDResult {
  ticker: string;
  issuer_name: string;
}

const MonasheeDeals: React.FC = () => {
  const [value, setValue] = useState(0); // For controlling tab selection
  const [searchTerm, setSearchTerm] = useState<string>(""); // Search term state
  const [results, setResults] = useState<MDDResult[]>([]); // Search results
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [selectedTicker, setSelectedTicker] = useState<string>("CRGX"); // Default selected ticker
  const [searchQuery, setSearchQuery] = useState(""); // State for query in deal search tab
  
  const apiUrl = process.env.REACT_APP_API_URL;

  // Handle change for tab selection
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
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
      const response = await fetch(`${apiUrl}/api/mdd_search/${query}`);
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      const data: MDDResult[] = await response.json();
      console.log("API Data:", data); // Log the data for debugging
      setResults(data); // Set the fetched results
    } catch (error) {
      console.error("Error fetching search results:", error);
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
        <Tab
          label={
            <Box sx={{ width: "100%", padding: 2 }}>
              <TextField
                label=""
                variant="outlined"
                value={searchTerm}
                autoComplete="off"  
                onChange={handleSearch}
                placeholder="Enter ticker..."
                style={{
                  marginBottom: "1px",
                  minWidth: "230px",
                  maxHeight: "45px",
                  backgroundColor: "#f4f6f9",
                  borderRadius: "8px",
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#656565" }} />
                    </InputAdornment>
                  ),
                }}
              />
              {loading ? (
                <CircularProgress />
              ) : (
                searchTerm.length > 0 && (
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
                )
              )}
            </Box>
          }
        />
        <Tab label="Deal Stats" />
        <Tab label="GAP Analysis" />
        <Tab label="Follow-On Discount" />
        <Tab label="Screener" />
      </Tabs>

      {/* Tab Content */}
      {value === 0 && selectedTicker && <MDDSelectedTicker ticker={selectedTicker} />}

      {value === 1 && <DealStats />}
      {value === 2 && <AllocationCaptureReturn />}
      {value === 3 && <FOllowOnDiscount />}
      {value === 4 && <MDDScreener />}
    </Box>
  );
};

export default MonasheeDeals;
