import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Autocomplete,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Search, Plus } from "lucide-react";
import { SelectedOption, TickerOption } from "../../types/NewDealFormData";
import DealFormSectionMainTable from "./DealFormSections/DealFormSectionMainTable";

function formatDateSimple(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const EquityNewDealFormMain: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<SelectedOption | null>(null);
  const [options, setOptions] = useState<TickerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoCompleteRef = useRef<HTMLInputElement>(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleSearchClick = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call - replace with actual endpoint
      const response = await axios.get(`${apiUrl}/api/new_deal_ticker_list/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setOptions(response.data as TickerOption[]);
    } catch (err) {
      console.error("API call failed, using mock data:", err);
      setError("API call failed, showing demo data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedOption({ ticker: "", pricing_date: "", create: true });
    
    if (autoCompleteRef.current) {
      autoCompleteRef.current.value = "";
    }
  };

  const handleAutocompleteChange = (event: any, value: TickerOption | null) => {
    if (value) {
      setSelectedOption({ ...value, create: false });
    } else {
      setSelectedOption(null);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box display="flex" flexDirection="column" gap={3}>
        {error && (
          <Alert severity="warning" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={handleCreateClick}
            sx={{ minWidth: 120 }}
          >
            Create New
          </Button>

          <Autocomplete
            options={options}
            getOptionLabel={(option) =>
              `${option.ticker} - ${formatDateSimple(option.pricing_date)}`
            }
            onChange={handleAutocompleteChange}
            onOpen={handleSearchClick}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Ticker"
                variant="outlined"
                size="small"
                inputRef={autoCompleteRef}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <Search size={18} style={{ marginRight: 8, color: '#666' }} />,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box>
                  <Box fontWeight="bold">{option.ticker}</Box>
                  <Box fontSize="0.875rem" color="text.secondary">
                    {formatDateSimple(option.pricing_date)}
                  </Box>
                </Box>
              </Box>
            )}
          />
        </Box>

        <DealFormSectionMainTable selectedOption={selectedOption} />
      </Box>
    </Paper>
  );
};

export default EquityNewDealFormMain;