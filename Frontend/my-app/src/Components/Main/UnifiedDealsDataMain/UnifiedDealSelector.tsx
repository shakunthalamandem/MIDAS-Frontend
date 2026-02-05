import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  CircularProgress,
  Container,
  Chip,
  Checkbox,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Define the custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#002060", // Custom primary color
    },
  },
});

interface DealOption {
  ticker: string;
  pricing_date: string;
  deal_id: string | null;
}

interface UnifiedDealSelectorProps {
  selected: string[];
  setSelected: (values: string[]) => void;
}

const UnifiedDealSelector: React.FC<UnifiedDealSelectorProps> = ({
  selected,
  setSelected,
}) => {
  const [options, setOptions] = useState<DealOption[]>([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  // Fetch ticker + deal_id options
  useEffect(() => {
    const fetchOptions = async () => {
      if (!apiUrl) return;
      setLoading(true);
      try {
        const resp = await axios.get<DealOption[]>(
          `${apiUrl}/api/unique_unified_tickers/`,
          {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          }
        );
        setOptions(resp.data);
      } catch (err) {
        console.error("Failed to fetch deal options:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, [apiUrl, token]);

  const availableOptions = useMemo(
    () => options.filter((opt) => !!opt.deal_id),
    [options]
  );

  const selectedOptions = useMemo(() => {
    return selected
      .map((val) => {
        const [ticker, deal_id] = val.split("|");
        if (!deal_id) return null;
        return (
          options.find(
            (opt) => opt.ticker === ticker && opt.deal_id === deal_id
          ) || { ticker, deal_id, pricing_date: "" }
        );
      })
      .filter(Boolean) as DealOption[];
  }, [options, selected]);

  const handleSelectionChange = (_: any, newValue: DealOption[]) => {
    const normalized = newValue
      .filter((opt) => opt.deal_id)
      .map((opt) => `${opt.ticker}|${opt.deal_id}`);
    setSelected(normalized);
  };

  // Remove a chip
  const handleDelete = (value: string) => {
    setSelected(selected.filter((item) => item !== value));
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Box display="flex" flexDirection="column" gap={2} sx={{ width: 350 }}>
          {/* Searchable multi-select */}
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={availableOptions}
            value={selectedOptions}
            loading={loading}
            getOptionLabel={(option) =>
              option.deal_id
                ? `${option.ticker} (${option.deal_id})`
                : option.ticker
            }
            isOptionEqualToValue={(option, value) =>
              option.ticker === value.ticker && option.deal_id === value.deal_id
            }
            filterOptions={(opts, state) => {
              const term = state.inputValue.trim().toLowerCase();
              if (!term) return opts;
              return opts
                .filter(
                  (opt) =>
                    opt.ticker.toLowerCase().includes(term) ||
                    (opt.deal_id ?? "").toLowerCase().includes(term)
                )
                .sort((a, b) => {
                  const aTicker = a.ticker.toLowerCase();
                  const bTicker = b.ticker.toLowerCase();
                  const aDeal = (a.deal_id ?? "").toLowerCase();
                  const bDeal = (b.deal_id ?? "").toLowerCase();

                  // Prioritize ticker startsWith, then deal startsWith, then contains
                  const rank = (ticker: string, deal: string) => {
                    if (ticker === term) return 0;
                    if (ticker.startsWith(term)) return 1;
                    if (deal.startsWith(term)) return 2;
                    if (ticker.includes(term)) return 3;
                    if (deal.includes(term)) return 4;
                    return 5;
                  };

                  return rank(aTicker, aDeal) - rank(bTicker, bDeal);
                });
            }}
            onChange={handleSelectionChange}
            renderTags={() => null} // keep the input clear for typing
            noOptionsText="No matches"
            renderOption={(props, option, { selected }) => (
              <li {...props} key={`${option.ticker}-${option.deal_id}`}>
                <Checkbox checked={selected} sx={{ mr: 1 }} />
                <Box>
                  <Typography fontWeight="bold">{option.ticker}</Typography>
                  <Typography variant="caption" color="#000000">
                    {option.deal_id}
                  </Typography>
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select deals"
                placeholder="Type ticker or deal id"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Chips for selected items */}
          {selected.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={1}>
              {selectedOptions.map((opt) => {
                const val = `${opt.ticker}|${opt.deal_id}`;
                return (
                  <Chip
                    key={val}
                    label={`${opt.ticker} (${opt.deal_id})`}
                    onDelete={() => handleDelete(val)}
                    color="primary"
                    variant="outlined"
                  />
                );
              })}
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default UnifiedDealSelector;
