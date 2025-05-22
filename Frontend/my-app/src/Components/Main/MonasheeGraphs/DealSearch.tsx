import React, { useState, useEffect } from "react";
import {
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Container,
  Box,
  Typography,
  InputAdornment,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import SelectedTicker from "./SelectedTicker";
import { useNavigate } from "react-router-dom";

// Define the type for the API response
interface MDDResult {
  ticker_symbol: string;
  issuer_name: string;
}

const GlobalDealSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [results, setResults] = useState<MDDResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTicker, setSelectedTicker] = useState<string>("AS"); // Set default ticker to "FANG"
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate(); 


  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/api/dealogic_search/${query}`, {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
              "Authorization": token ? `Bearer ${token}` : "",
          },
      }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      const data: MDDResult[] = await response.json(); // Type the response
      setResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
      // navigate("/error");  

      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle selecting an item from the list
  const handleItemClick = (ticker_symbol: string) => {
    setSelectedTicker(ticker_symbol); // Set the selected ticker when clicked
    setSearchTerm(""); // Clear the search term
    setResults([]); // Clear the results list
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Box sx={{ width: "100%", padding: 2 }}>
        <TextField
          label="Search Global Equity Market Deals"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          autoComplete="off"
          placeholder="Enter ticker symbol or issuer name..."
          style={{
            marginBottom: "20px",
            minWidth: "300px",
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
                      onClick={() => handleItemClick(item.ticker_symbol)}
                      component="li"
                      style={{
                        backgroundColor:
                          selectedTicker === item.ticker_symbol
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
                        (e.currentTarget.style.backgroundColor = selectedTicker === item.ticker_symbol
                          ? "rgba(63, 81, 181, 0.1)"
                          : "transparent")
                      }
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
          )
        )}
      </Box>

      {/* If a ticker is selected, render the SelectedTicker component */}
      {selectedTicker && <SelectedTicker ticker={selectedTicker} />}
    </Container>
  );
};

export default GlobalDealSearch;
