import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  InputAdornment,
  Autocomplete,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CardContent,
  Card
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
}

const IPODashboardHeader: React.FC<IPODashboardHeaderProps> = ({
  ipoData,
  allIpoTickers,
  selectedTicker,
  searchText,
  setSelectedTicker,
  setSearchText,
}) => {
  const [openValuationDialog, setOpenValuationDialog] = useState(false);

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="h5"
            color="#002060"
            sx={{ fontWeight: 600, mt: 2, mb: 2, mr: 2 }}
          >
            {ipoData.company_name} ({ipoData.ticker_name} | {ipoData.exchange})
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setOpenValuationDialog(true)}
          >
            View Valuation
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

      <Dialog
        open={openValuationDialog}
        onClose={() => setOpenValuationDialog(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 0,
            boxShadow: "none",
            backgroundColor: "transparent",
            overflow: "visible",
            p: 0,
          },
        }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            background: "linear-gradient(to right, #fff3e0, #fce4ec)",
            p: 3,
            maxWidth: 600,
            width: "100%",
            mx: "auto",
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 700, color: "#6a1b9a" }}
              align="center"
            >
              Valuation Information
            </Typography>
            {Array.isArray(ipoData.valuation) && ipoData.valuation.length > 0 ? (
              <Box component="ul" sx={{ pl: 2, color: "#333" }}>
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
          </CardContent>
          <Box textAlign="center" mt={2}>
            <Button onClick={() => setOpenValuationDialog(false)} variant="outlined">
              Close
            </Button>
          </Box>
        </Card>
      </Dialog>

    </Container>
  );
};

export default IPODashboardHeader;
