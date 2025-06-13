import React from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  InputAdornment,
  Autocomplete,
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
        <Typography
          variant="h5"
          color="#002060"
          sx={{ fontWeight: 600, mt: 2, mb: 2 }}
        >
          {ipoData.company_name} ({ipoData.ticker_name} | {ipoData.exchange})
        </Typography>

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
    </Container>
  );
};

export default IPODashboardHeader;
