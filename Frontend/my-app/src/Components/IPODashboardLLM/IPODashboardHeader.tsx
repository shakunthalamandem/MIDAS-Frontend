// IPODashboardHeader.tsx
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
import IPODealsS1DealData from "./IPODealsS1DealData";
import IPOSummaryTable from "./IPODashboardMain/IPOSummaryTable";

interface TickerOption {
  ticker_name: string;
  pricing_date: string | null;
}

interface IPODashboardHeaderProps {
  ipoData: any;
  allIpoTickers: TickerOption[];
  selectedTicker: string | null;
  searchText: string;
  setSelectedTicker: (ticker: string | null) => void;
  setSearchText: (text: string) => void;
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
  onExportPDF,
  pdfLoading,
}) => {
  // ✅ Sort tickers: no date → top, then newest first
  const sortedTickers = [...allIpoTickers].sort((a, b) => {
    if (!a.pricing_date && !b.pricing_date) return 0;
    if (!a.pricing_date) return -1; // a goes on top
    if (!b.pricing_date) return 1; // b goes on top
    return new Date(b.pricing_date).getTime() - new Date(a.pricing_date).getTime(); // desc order
  });

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
          getOptionLabel={(option) => {
            let formattedDate = "N/A";
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
            setSearchText(newValue ? newValue.ticker_name : "");
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
      <IPOdashboardLine ipodata={ipoData} />
      <IPOSummaryTable
        ipodata={ipoData}
        selectedTicker={selectedTicker || ""}
        setIpoData={setSelectedTicker}
      />
      <IPODealsS1DealData selectedTicker={selectedTicker || ""} />
    </Container>
  );
};

export default IPODashboardHeader;
