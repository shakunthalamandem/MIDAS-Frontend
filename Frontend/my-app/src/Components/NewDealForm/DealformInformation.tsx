import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  CardContent,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NewDealFormMainTable from "./NewDealFormMainTable";
import BasicInfo from "./BasicInfo";
import MDDSelectedTicker from "../Main/MonasheeDeals/MddGraphs/MDDSelectedTicker";

interface Data {
  ticker: string;
  deal_id: string;
}

const DealformInformation = () => {
  const location = useLocation();
  const passedTicker = location.state?.ticker;

  // Now selectedTicker holds both ticker and deal_id
  const [selectedTicker, setSelectedTicker] = useState<{ ticker: string; deal_id?: string }>({
    ticker: passedTicker || "SARO",
    deal_id: undefined,
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [results, setResults] = useState<Data[]>([]);
  const [allTickers, setAllTickers] = useState<Data[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (passedTicker) {
      setSelectedTicker({ ticker: passedTicker, deal_id: undefined });
    }
  }, [passedTicker]);

  const fetchAllTickers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/new_deal_search_all/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tickers");
      }
      const data = await response.json();
      const formatted = data.map((item: Data) => ({
        ...item,
        ticker: item.ticker.toUpperCase(),
      }));
      setAllTickers(formatted);
      setResults(formatted); // initial full list
    } catch (err) {
      console.error("Error fetching tickers:", err);
      setError("Failed to load tickers.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.trim() === "") {
      setResults(allTickers);
    } else {
      const filtered = allTickers.filter((item) =>
        item.ticker.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    }
  };

  // Now handleItemClick sets both ticker and deal_id
  const handleItemClick = (ticker: string, deal_id: string) => {
    setSelectedTicker({ ticker: ticker.toUpperCase(), deal_id });
    setSearchTerm("");
    setShowDropdown(false);
    setResults([]);
  };

  return (
    <>
      <Box
        sx={{
          fontWeight: 500,
          color: "#FFFFFF",
          fontSize: { xs: "1rem", sm: "1.2rem" },
          backgroundColor: "#002060",
          textAlign: "center",
          py: 1,
          borderRadius: 2,
          mb: 2,
          boxShadow: 2,
        }}
      >
        Welcome to the Deal Information Form! Easily input all relevant details
        and track key deal parameters, from pricing and terms to deadlines and
        special conditions.
      </Box>

      <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4, marginTop: 2 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            flexWrap="wrap"
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, minWidth: "fit-content", color: "#002060" }}
            >
              Deal Information Form
            </Typography>

            <TextField
              label="Search Ticker"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearch}
              onFocus={() => {
                setShowDropdown(true);
                if (allTickers.length === 0) {
                  fetchAllTickers();
                } else {
                  setResults(allTickers);
                }
              }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              autoComplete="off"
              placeholder="Enter ticker symbol..."
              size="small"
              sx={{
                flexGrow: 1,
                maxWidth: 200,
                backgroundColor: "#f9f9f9",
                borderRadius: 1,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#000000" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </CardContent>

        {loading ? (
          <CircularProgress />
        ) : (
          showDropdown && results.length > 0 && (
            <Paper
              elevation={3}
              sx={{
                padding: 1,
                position: "absolute",
                marginTop: "-10px",
                marginLeft: { xs: 0, sm: 110 },
                maxHeight: 300,
                overflowY: "auto",
                backgroundColor: "#ffffff",
                borderRadius: 2,
                zIndex: 10,
              }}
            >
              <List>
                {results.map((item: Data, index: number) => (
                  <ListItem
                    key={index}
                    onClick={() => handleItemClick(item.ticker, item.deal_id)}
                    style={{
                      backgroundColor:
                        selectedTicker.ticker === item.ticker
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
                        selectedTicker.ticker === item.ticker
                          ? "rgba(63, 81, 181, 0.1)"
                          : "transparent")
                    }
                  >
                    <ListItemText
                      primary={<strong>{item.ticker}</strong>}
                      secondary={item.deal_id}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )
        )}

        {/* Conditional Rendering */}
        {selectedTicker.ticker ? (
          <>
            <NewDealFormMainTable selecteditems={selectedTicker} />
            <MDDSelectedTicker ticker={selectedTicker.ticker} />
          </>
        ) : (
          <BasicInfo />
        )}
      </Container>
    </>
  );
};

export default DealformInformation;