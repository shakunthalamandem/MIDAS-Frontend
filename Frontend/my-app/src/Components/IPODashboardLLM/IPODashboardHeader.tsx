import React from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  InputAdornment,
  Autocomplete,
  Button,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { format } from "date-fns";
import IPOdashboardLine from "./IPOdashboardLine";
import IPODealSummarySection from "./IPODealSummarySection";
import IPOSummaryTable from "./IPODashboardMain/IPOSummaryTable";
import IPOValuationSection from "./IPOValuationSection";
import { useEffect } from "react";


interface TickerOption {
  ticker_name: string;
  company_name?: string;
  exchange?: string;
  pricing_date: string | null;
  valuation?: string[];
}

interface IPODashboardHeaderProps {
  ipoData: any;
  allIpoTickers: TickerOption[];
  selectedTicker: string | null;
  searchText: string;
  setSelectedTicker: (ticker: string | null) => void;
  setSearchText: (text: string) => void;
  setIpoData: (data: any) => void;
  onExportPDF: () => void;
  pdfLoading: boolean;
}

const IPODashboardHeader: React.FC<IPODashboardHeaderProps> = ({
  ipoData,
  allIpoTickers,
  selectedTicker,
  searchText,
  setSelectedTicker,
  setSearchText,
  setIpoData,
  onExportPDF,
  pdfLoading,
}) => {
  // ✅ Sort tickers: no date → top, then newest first
  const sortedTickers = [...allIpoTickers].sort((a, b) => {
    const aTime = a.pricing_date ? Date.parse(a.pricing_date) : NaN;
    const bTime = b.pricing_date ? Date.parse(b.pricing_date) : NaN;
    const aValid = !Number.isNaN(aTime);
    const bValid = !Number.isNaN(bTime);

    if (!aValid && !bValid) return 0;
    if (!aValid) return 1;
    if (!bValid) return -1;
    return bTime - aTime;
  });

  useEffect(() => {
  if (!selectedTicker) return;

  const match = sortedTickers.find(
    (t) => t.ticker_name === selectedTicker
  );

  if (match) {
    let formattedDate = "TBA";
    if (match.pricing_date) {
      try {
        formattedDate = format(
          new Date(match.pricing_date),
          "dd MMM yyyy"
        );
      } catch {
        formattedDate = match.pricing_date;
      }
    }

    // 🔑 URL → search bar sync
    setSearchText(`${match.ticker_name} (${formattedDate})`);
  }
}, [selectedTicker, sortedTickers, setSearchText]);


  return (
    <Container maxWidth="xl" sx={{ mb: 2 }}>
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
            className="pdf-hidden"
            disabled={pdfLoading}
            startIcon={pdfLoading ? <CircularProgress color="inherit" size={18} /> : null}
          >
            {pdfLoading ? "Generating..." : "Generate Monashee PDF"}
          </Button>
        </Box>

        {/* Search Dropdown */}
        <Autocomplete
          size="small"
          options={sortedTickers}
          className="pdf-hidden"
          getOptionLabel={(option) => {
            let formattedDate = "TBA";
            if (option.pricing_date) {
              try {
                formattedDate = format(new Date(option.pricing_date), "dd MMM yyyy");
              } catch {
                formattedDate = option.pricing_date; // fallback
              }
            }
            return `${option.ticker_name} (${formattedDate})`;
          }}
          value={sortedTickers.find((t) => t.ticker_name === selectedTicker) || null}
          onChange={(_, newValue) => {
            setSelectedTicker(newValue ? newValue.ticker_name : null);
            setSearchText("");
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

      {/* Child Components */}
      <IPOdashboardLine
        ipodata={ipoData}
        selectedTicker={selectedTicker || ""}
        setIpoData={setIpoData}
      />

      {/* Fair value first */}
      <IPODealSummarySection
        selectedData={{
          ticker_name: ipoData?.ticker_name,
        }}
      />

      {/* Pricing date / price range next */}
      <IPOSummaryTable
        ipodata={ipoData}
        selectedTicker={selectedTicker || ""}
        setIpoData={setIpoData}
      />

      {/* Valuation information */}
      <IPOValuationSection
        selectedData={{
          ticker_name: ipoData?.ticker_name,
          company_name: ipoData?.company_name,
          exchange: ipoData?.exchange,
          valuation: ipoData?.valuation || [],
          valuation_image_url:
            ipoData?.valuation_image_url ||
            ipoData?.valuation_image ||
            ipoData?.valuation_image_id ||
            "",
        }}
      />
    </Container>
  );
};

export default IPODashboardHeader;
