import React from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  InputAdornment,
  Autocomplete,
  Card,
  Button,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import IPOdashboardLine from "./IPOdashboardLine";

interface IPODashboardHeaderProps {
  ipoData: any;
  allIpoTickers: string[];
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
            startIcon={
              pdfLoading ? (
                <CircularProgress color="inherit" size={18} />
              ) : null
            }
          >
            {pdfLoading ? "Generating..." : "Export to PDF"}
          </Button>
        </Box>

        <Autocomplete
          size="small"
          options={allIpoTickers}
          value={selectedTicker}
          onChange={(_, newValue) => {
            setSelectedTicker(newValue);
            setSearchText(newValue || "");
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
          freeSolo
        />
      </Box>

      <IPOdashboardLine ipodata={ipoData} />

      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          background: "linear-gradient(to right,rgb(172, 229, 236),rgb(234, 245, 176))",
          mb: 2,
          mt: 4,
          width: "100%",
          mx: "auto",
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 2, mt: 2, fontWeight: 700, color: "#6a1b9a" }}
          align="center"
        >
          Valuation Information
        </Typography>

        {Array.isArray(ipoData.valuation) && ipoData.valuation.length > 0 ? (
          <Box component="ul" sx={{ pl: 4, color: "#333" }}>
            {ipoData.valuation.map((item: string, index: number) => (
              <li key={index} style={{ marginBottom: 8, lineHeight: 1.6 }}>
                {item}
              </li>
            ))}
          </Box>
        ) : (
          <Typography
            variant="body1"
            sx={{
              color: "#333",
              fontSize: "1rem",
              textAlign: "center",
              wordBreak: "break-word",
            }}
          >
            No valuation data available.
          </Typography>
        )}
      </Card>
    </Container>
  );
};

export default IPODashboardHeader;
