import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, MenuItem, Box, Typography } from "@mui/material";

// Define the type for the API response
interface Ticker {
  id: number;
  ticker: string;
}

const TickerDropdown: React.FC = () => {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [filteredTickers, setFilteredTickers] = useState<Ticker[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTicker, setSelectedTicker] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  useEffect(() => {
    // Fetch tickers from API
    const fetchTickers = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;

        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        // Fetch data with type annotation for Axios response
        const response = await axios.get<Ticker[]>(`${apiUrl}/populate-invested-tickers/`);
        setTickers(response.data);
        setFilteredTickers(response.data);
      } catch (error) {
        console.error("Error fetching tickers:", error);
      }
    };

    fetchTickers();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);

    // Filter tickers based on the search term
    const filtered = tickers.filter((ticker) =>
      ticker.ticker.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTickers(filtered);
  };

  const handleSelectTicker = (ticker: string) => {
    setSelectedTicker(ticker);
    setSearchTerm(""); // Clear search term after selection
    setShowDropdown(false); // Hide dropdown after selection
  };

  return (
    <Box sx={{ textAlign: "center", marginTop: "50px" }}>
      <Box
        sx={{ display: "inline-block", textAlign: "left", position: "relative" }}
        onMouseEnter={() => setShowDropdown(true)}
        onMouseLeave={() => setShowDropdown(false)}
      >
        <TextField
          id="ticker-search"
          label="Search Ticker"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ marginBottom: "10px", width: "300px" }}
        />
        {showDropdown && (
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              maxHeight: "250px",
              overflowY: "auto",
              backgroundColor: "#fff",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
              position: "absolute",
              width: "100%",
              zIndex: 10,
            }}
          >
            {filteredTickers.map((ticker) => (
              <MenuItem
                key={ticker.id}
                onClick={() => handleSelectTicker(ticker.ticker)}
                sx={{ cursor: "pointer" }}
              >
                {ticker.ticker}
              </MenuItem>
            ))}
            {filteredTickers.length === 0 && (
              <Typography sx={{ padding: "10px", textAlign: "center", color: "#888" }}>
                No tickers found
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {selectedTicker && (
        <Box
          sx={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            display: "inline-block",
            backgroundColor: "#f9f9f9",
            fontSize: "20px",
          }}
        >
          Selected Ticker: <strong>{selectedTicker}</strong>
        </Box>
      )}
    </Box>
  );
};

export default TickerDropdown;
