import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, FormControl, InputLabel, TextField, Autocomplete } from "@mui/material";
import { useNavigate } from "react-router-dom";

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
        navigate("/error");  

      }
    };

    fetchTickers();
  }, [apiUrl, token]);

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
          options={tickers}
          value={age}
          onChange={(_, newValue) => setAge(newValue || "")}
          renderInput={(params) => <TextField {...params} label="Select Ticker" />}
          renderOption={(props, option) => <li {...props}>{option}</li>}
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