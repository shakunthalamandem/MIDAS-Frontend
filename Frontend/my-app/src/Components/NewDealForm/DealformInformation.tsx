import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  InputAdornment,
  CircularProgress,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Replace with your actual environment variable name
const apiUrl = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("token");

const DealformInformation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTicker, setSelectedTicker] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleItemClick = (ticker: string) => {
    setSelectedTicker(ticker);
    setSearchTerm("");
    setResults([]);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!searchTerm) return;

      setLoading(true);
      setError("");

      try {
        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const payload = { ticker: searchTerm };
        const response = await fetch(`${apiUrl}/api/new-deal/search/${searchTerm}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const result = await response.json();
          setResults(result || []); // assuming it's an array like [{ ticker: "KGF" }]
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500); // debounce to reduce unnecessary API calls

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Box sx={{ width: "100%", padding: 2 }}>
        <TextField
          label="Search Global Equity Market Deals"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          autoComplete="off"
          placeholder="Enter ticker symbol..."
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
                  {results.map((item: any, index: number) => (
                    <ListItem
                      key={index}
                      onClick={() => handleItemClick(item.ticker)}
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
                      <ListItemText primary={<strong>{item.ticker}</strong>} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          )
        )}
      </Box>

      {/* Display selected ticker */}
      {selectedTicker && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6">Selected Ticker: {selectedTicker}</Typography>
        </Box>
      )}
    </Container>
  );
};

export default DealformInformation;
