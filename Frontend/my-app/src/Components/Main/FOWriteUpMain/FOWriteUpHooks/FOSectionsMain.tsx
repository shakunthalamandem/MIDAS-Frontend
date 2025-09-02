import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Autocomplete,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FOComparisionTableMain from "../FOWriteSections/FOComparisionTableMain";
import FOFinancialHighlights from "../FOWriteSections/FOFinancialHighlights";
import FOSummaryDataSection from "./FOSummaryDataSection";
import { format } from "date-fns";

interface FOSectionsMainProps {
  ticker: string;
  deal_id: string;
  selected: { ticker: string; deal_id: string } | null;
  setSelected: React.Dispatch<
    React.SetStateAction<{ ticker: string; deal_id: string } | null>
  >;
}

interface TickerData {
  ticker: string;
  company_name?: string; // optional
  pricing_date?: string | null;
  deal_id: string;
  exchange?: string | null;
  expected_listing_date?: string | null;
}

const FOSectionsMain: React.FC<FOSectionsMainProps> = ({
  ticker,
  deal_id,
  selected,
  setSelected,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const [pdfLoading, setPdfLoading] = useState(false);
  const [ipoData, setIpoData] = useState<TickerData | null>(null);
  const [sortedTickers, setSortedTickers] = useState<TickerData[]>([]);
  const [searchText, setSearchText] = useState<string>(ticker);

  // 🔹 Fetch ticker list for search
  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/fo_writeup_distinct_tickers/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        const data: TickerData[] = await response.json();
        setSortedTickers(data);
      } catch (error) {
        console.error("Failed to fetch tickers:", error);
      }
    };

    fetchTickers();
  }, [apiUrl, token]);

  // 🔹 Fetch selected ticker details using POST
  const fetchIpoDetails = async (tickerSymbol: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/fowriteup_ticker_data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ticker: tickerSymbol }),
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data: TickerData = await response.json();
      console.log("IPO Data Response:", data);
      setIpoData(data);
    } catch (error) {
      console.error("Failed to fetch IPO details:", error);
    }
  };

  // 🔹 Load IPO details when ticker or selected changes
  useEffect(() => {
    if (selected?.ticker) {
      fetchIpoDetails(selected.ticker);
      setSearchText(selected.ticker);
    } else if (ticker) {
      fetchIpoDetails(ticker);
    }
  }, [selected, ticker]);

  const onExportPDF = () => {
    setPdfLoading(true);
    setTimeout(() => setPdfLoading(false), 2000);
  };

const handleAutocompleteChange = (_: any, newValue: TickerData | null) => {
  if (newValue) {
    setSelected({ ticker: newValue.ticker, deal_id: newValue.deal_id });
  }
};


  return (
    <>
      {/* 🔹 Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* Company Info and Button */}
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Typography variant="h5" color="#002060" sx={{ fontWeight: 600 }}>
            {ipoData
              ? `${ipoData.company_name ?? "Unknown Company"} (${ipoData.ticker ?? "N/A"} | ${
                  ipoData.exchange ?? "N/A"
                })`
              : "Loading..."}
          </Typography>

          <Button
            variant="contained"
            onClick={onExportPDF}
            sx={{
              backgroundColor: "#002060",
              color: "#ffffff",
              textTransform: "none",
              px: 3,
              py: 1,
              minWidth: "130px",
            }}
            disabled={pdfLoading}
            startIcon={pdfLoading ? <CircularProgress color="inherit" size={18} /> : null}
          >
            {pdfLoading ? "Generating..." : "Generate Monashee PDF"}
          </Button>
        </Box>

        {/* 🔹 Search Autocomplete */}
        <Autocomplete
          size="small"
          options={sortedTickers}
          getOptionLabel={(option) => {
            let formattedDate = "N/A";
            if (option.pricing_date) {
              try {
                formattedDate = format(new Date(option.pricing_date), "dd MMM yyyy");
              } catch {
                formattedDate = option.pricing_date || "N/A";
              }
            }
            return `${option.ticker} (${formattedDate})`;
          }}
          value={sortedTickers.find((t) => t.ticker === selected?.ticker) || null}
          onChange={handleAutocompleteChange}
          inputValue={searchText}
          onInputChange={(_, newInputValue) => setSearchText(newInputValue)}
          sx={{ width: { xs: "100%", sm: "300px" } }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search ticker..."
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Box>

      {/* 🔹 Sections */}
      <FOSummaryDataSection ticker={selected?.ticker || ""} deal_id={selected?.deal_id || ""} />
      <FOComparisionTableMain ticker={selected?.ticker || ""} deal_id={selected?.deal_id || ""} />
      <FOFinancialHighlights ticker={selected?.ticker || ""} deal_id={selected?.deal_id || ""} />
    </>
  );
};

export default FOSectionsMain;
