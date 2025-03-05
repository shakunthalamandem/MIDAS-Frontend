import React, { useState,useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";


import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Paper,
} from "@mui/material";
import HYSkewTableMain from "./Tabs/HYSkewTableMain";
import DealStatsMain from "./Tabs/DealStatsMain";
import SelectedDealHYMain from "./Tabs/SelectedDealHYMain";

const HighYieldsMain: React.FC = () => {
  const [value, setValue] = useState<number>(0);
  const navigate = useNavigate(); 
  const { ticker: routeTicker } = useParams<{ ticker: string }>();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTicker, setSelectedTicker] = useState<string>(routeTicker || "AS"); 
  const [results, setResults] = useState<HighYieldResult[]>([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
useEffect(() => {
    const path = window.location.pathname.split("/").pop();
    switch (path) {
      case "deal-stats":
        setValue(1);
        break;
      case "skew-table":
        setValue(2);
        break;
      default:
        setValue(0);
        break;
    }
  }, [window.location.pathname]);
  
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    const tabPaths = ["", "deal-stats", "skew-table"];
    navigate(`/highyield/capital-markets/${tabPaths[newValue]}`);
  };
  interface HighYieldResult {
    ticker_symbol: string;
    issuer_name: string;
  }

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/highyield_search/${query}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
        },
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
    }
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      const data: HighYieldResult[] = await response.json(); // Type the response
      setResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (ticker: string) => {
    setSelectedTicker(ticker);
    setSearchTerm("");
    setResults([]);
  };

  return (
    <Box sx={{ width: "100%", backgroundColor: "#fff" }}>
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
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          animation: "fadeIn 1.5s ease-in-out",
          "@keyframes fadeIn": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 },
          },
        }}
      >
        Welcome to HighYields New Issue Equity Markets! Explore deals and uncover
        statistics from the global market with ease.
      </Typography>
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
            transition:
              "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
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
            <TextField
              label=""
              variant="outlined"
              value={searchTerm}
              autoComplete="off"
              onChange={handleSearch}
              placeholder="Enter ticker..."
              sx={{
                marginBottom: "1px",
                width: "200px",
                height: "40px",
                borderRadius: "32px", 
                backgroundColor: "#f4f6f9",
              }}
              InputProps={{
                sx: {
                  borderRadius: "42px",
                  width: "200px",
                  height: "40px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    // borderColor: "#002060",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#002060",
                  },
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#656565" }} />
                  </InputAdornment>
                ),
              }}
            />
          }
        />

        <Tab
          label="Deal Stats"
          sx={{
            backgroundColor: value === 1 ? "#9C27B0" : "#f5f5f5",
            color: value === 1 ? "#fff" : "#777",
            "&.Mui-selected": {
              backgroundColor: "#9C27B0",
              color: "#fff",
            },
          }}
        />
        <Tab
          label="Skew Table"
          sx={{
            backgroundColor: value === 2 ? "#9C27B0" : "#f5f5f5",
            color: value === 2 ? "#fff" : "#777",
            "&.Mui-selected": {
              backgroundColor: "#9C27B0",
              color: "#fff",
            },
          }}
        />

      </Tabs>

      {loading ? (
        <CircularProgress />
      ) : (
        searchTerm.length > 0 && (
          <Box
            sx={{ marginBottom: "20px", display: "flex", marginLeft: "600px" }}
          >
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
                <Typography
                  variant="body2"
                  color="textSecondary"
                  align="center"
                >
                  No results found.
                </Typography>
              ) : (
                <List>
                  {results.map((item, index) => (
                    <ListItem
                      key={index}
                      onClick={() => handleItemClick(item.ticker_symbol)}
                      style={{
                        backgroundColor:
                          selectedTicker === item.ticker_symbol
                            ? "rgba(63, 81, 181, 0.1)"
                            : "transparent",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                      }}
                    >
                      <ListItemText
                        primary={<strong>{item.ticker_symbol}</strong>}
                        secondary={item.issuer_name}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Box>
        )
      )}

      {value === 0 && selectedTicker && (
        <SelectedDealHYMain  />
      )}
      {value === 1 && <DealStatsMain />}
      {value === 2 && <HYSkewTableMain />}
    </Box>
  );
};

export default HighYieldsMain;
