import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
  TextField,
  SelectChangeEvent,
  Container,
  Checkbox,
  ListItemText,
  Chip,
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
  const [filtered, setFiltered] = useState<DealOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  // Fetch ticker + pricing_date options
  useEffect(() => {
    const fetchOptions = async () => {
      if (!apiUrl) return;
      setLoading(true);
      try {
        const resp = await axios.get<DealOption[]>(`${apiUrl}/api/unique_unified_tickers/`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        setOptions(resp.data);
        setFiltered(resp.data);
      } catch (err) {
        console.error("Failed to fetch deal options:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, [apiUrl, token]);

  // Handle search filtering
  useEffect(() => {
    if (!search) {
      setFiltered(options);
    } else {
      setFiltered(
        options.filter(
          (item) =>
            item.ticker.toLowerCase().includes(search.toLowerCase()) ||
            item.pricing_date.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, options]);

  // Handle dropdown change
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    setSelected(event.target.value as string[]);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Box display="flex" flexDirection="column" gap={2} sx={{ width: 350 }}>
          {/* Search input */}
          <TextField
            size="small"
            placeholder="Search ticker or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Dropdown select */}
          <FormControl fullWidth>
            <InputLabel>Select Deals</InputLabel>
            <Select
              multiple
              value={selected}
              onChange={handleChange}
              input={<OutlinedInput label="Select Deals" />}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300, // dropdown max height
                    width: 350,
                  },
                },
              }}
            >
              {loading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : (
                filtered.length > 0 ? (
                  filtered.map((item, idx) => {
                    const value = `${item.ticker}|${item.pricing_date}`;
                    return (
                      <MenuItem key={idx} value={value}>
                        <Checkbox checked={selected.indexOf(value) > -1} />
                        <ListItemText
                          primary={<Typography fontWeight="bold">{item.ticker}</Typography>}
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {new Date(item.pricing_date).toLocaleDateString()}
                            </Typography>
                          }
                        />
                      </MenuItem>
                    );
                  })
                ) : (
                  <MenuItem disabled>No results found</MenuItem>
                )
              )}
            </Select>
          </FormControl>

          {/* Display selected tickers as chips */}
          {selected.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
              {selected.slice(0, 2).map((val) => {
                const [ticker, date] = val.split("|");
                return (
                  <Chip
                    key={val}
                    label={`${ticker} (${new Date(date).toLocaleDateString()})`}
                    onDelete={() => setSelected(selected.filter((s) => s !== val))}
                  />
                );
              })}
              {selected.length > 2 && (
                <Chip label={`+${selected.length - 2} more`} color="primary" variant="outlined" />
              )}
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default UnifiedDealSelector;
