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
}

interface TickerData {
  ticker: string;
  issuer_name: string;
  pricing_date: string | null;
  deal_id: string;
  exchange: string;
  deal_size: number;
  expected_listing_date: string | null;
}

const FOSectionsMain: React.FC<FOSectionsMainProps> = ({ ticker, deal_id }) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const [pdfLoading, setPdfLoading] = useState(false);
  const [ipoData, setIpoData] = useState({
    company_name: "Company Name",
    ticker_name: ticker,
    exchange: "NYSE",
    pricing_date: null,
  });
  const [sortedTickers, setSortedTickers] = useState<TickerData[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(ticker);
  const [searchText, setSearchText] = useState<string>(ticker);

  // 🔹 Fetch ticker data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/fo_writeup_distinct_tickers/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data: TickerData[] = await response.json();
        setSortedTickers(data);
      } catch (error) {
        console.error("Failed to fetch tickers:", error);
      }
    };

    fetchData();
  }, [apiUrl, token]);

  const onExportPDF = () => {
    setPdfLoading(true);
    setTimeout(() => setPdfLoading(false), 2000); // Simulate PDF generation
  };

  return (
    <>
      {/* 🔹 Header Section with Button & Search */}
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
        {/* Header Left */}
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Typography variant="h5" color="#002060" sx={{ fontWeight: 600 }}>
            {ipoData.company_name} ({ipoData.ticker_name} | {ipoData.exchange})
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

        {/* 🔹 Search Dropdown */}
        <Autocomplete
          size="small"
          options={sortedTickers}
          getOptionLabel={(option) => {
            let formattedDate = "N/A";
            if (option.pricing_date) {
              try {
                formattedDate = format(new Date(option.pricing_date), "dd MMM yyyy");
              } catch {
                formattedDate = option.pricing_date;
              }
            }
            return `${option.ticker} (${formattedDate})`;
          }}
          value={sortedTickers.find((t) => t.ticker === selectedTicker) || null}
          onChange={(_, newValue) => {
            setSelectedTicker(newValue ? newValue.ticker : null);
            setSearchText(newValue ? newValue.ticker : "");
          }}
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

      {/* 🔹 Existing Sections */}
      <FOSummaryDataSection ticker={ticker} deal_id={deal_id} />
      <FOComparisionTableMain ticker={ticker} deal_id={deal_id} />
      <FOFinancialHighlights ticker={ticker} deal_id={deal_id} />
    </>
  );
};

export default FOSectionsMain;
