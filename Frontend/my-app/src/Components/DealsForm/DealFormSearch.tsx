import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, FormControl, TextField, Autocomplete, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add"; // Import the Add Icon

interface ApiResponse {
  tickers: string[];
}

const DealFormSearch: React.FC = () => {
  const [age, setAge] = useState(''); 
  const [tickers, setTickers] = useState<string[]>([]); 
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchTickers = async () => {
      if (!apiUrl || !token) return;

      try {
        const response = await axios.get<ApiResponse>(`${apiUrl}/api/new_issue_search_ticker/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response && Array.isArray(response.data.tickers)) {
          setTickers(response.data.tickers);
        }
      } catch (error) {
        console.error("Error fetching tickers:", error);
        // navigate("/error");  
      }
    };

    fetchTickers();
  }, [apiUrl, token]);

  // Handler for creating a new ticker (You can modify this logic as needed)
  const handleCreateNewTicker = () => {
    // Logic to create a new ticker or handle new item
    console.log("Creating a new ticker...");
    // Example: navigate to the create page or show a modal
    navigate("/create-ticker");
  };

  return (
    <Box 
      sx={{
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "10vh",
      }}
    >
      <FormControl sx={{ m: 1, minWidth: 190 }} size="small">
        <Autocomplete
          id="autocomplete-ticker"
          options={["Create", ...tickers]} // Add the 'Create' option at the top
          value={age}
          onChange={(_, newValue) => {
            if (newValue === "Create") {
              handleCreateNewTicker(); // Handle create action
            } else {
              setAge(newValue || "");
            }
          }}
          renderInput={(params) => <TextField {...params} label="Select Ticker" />}
          renderOption={(props, option) => (
            <li {...props}>
              {option === "Create" ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AddIcon sx={{ mr: 1 }} /> {/* Add Icon */}
                  Create
                </Box>
              ) : (
                option
              )}
            </li>
          )}
          disableClearable
          isOptionEqualToValue={(option, value) => option === value}
          size="small"
          freeSolo
        />
      </FormControl>
    </Box>
  );
};

export default DealFormSearch;
