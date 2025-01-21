import React, { useState } from "react";
import {
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Container,
  Box,
} from "@mui/material";
import MDDSelectedTicker from "./MDDSelectedTicker";

// Define the type for the API response
interface MDDResult {
  ticker_us: string;
  issuer_name: string;
}

const MDDDealSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [results, setResults] = useState<MDDResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;

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
        `${apiUrl}/api/mdd_search/${query}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      const data: MDDResult[] = await response.json(); // Type the response
      setResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle selecting an item from the list
  const handleItemClick = (ticker: string) => {
    setSelectedTicker(ticker); // Set the selected ticker when clicked
    setSearchTerm(""); // Clear the search term
    setResults([]); // Clear the search results
  };
  

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Box sx={{ width: "100%", padding: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchTerm}
          autoComplete="off" // Disable autocomplete
          onChange={handleSearch}
          style={{ marginBottom: "20px",
            minWidth:'300px' 
          }}
        />
        {loading ? (
  <CircularProgress />
) : (
  searchTerm.length > 0 && ( // Show Paper for any non-empty search term
    <Paper
      elevation={3}
      style={{
        padding: "10px",
        maxWidth: "280px",
        maxHeight: "300px", // Limit the height of the options
        overflowY: "auto", // Add scroll if the content overflows
      }}
    >
      <List>
        {results.map((item, index) => (
          <ListItem
            key={index}
            onClick={() => handleItemClick(item.ticker_us)} // Pass only ticker_us
            component="li"
            style={{
              backgroundColor:
                selectedTicker === item.ticker_us
                  ? "rgba(63, 81, 181, 0.1)" // Light blue background for selected item
                  : "transparent",
            }}
          >
            <ListItemText
              primary={<strong>{item.ticker_us}</strong>}
              secondary={item.issuer_name}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
)}
      </Box>

      {/* If a ticker is selected, render the SelectedTicker component */}
      {selectedTicker && <MDDSelectedTicker ticker={selectedTicker} />}
    </Container>
  );
};

export default MDDDealSearch;
