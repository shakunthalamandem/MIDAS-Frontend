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
  Container,
  Checkbox,
  ListItemText,
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
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  // Fetch ticker + pricing_date options
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

  // Handle dropdown change
  const handleChange = (event: any) => {
    setSelected(event.target.value);
  };

  // Get the label for the selected items in the dropdown
  const getSelectedLabel = () => {
    if (selected.length === 0) return "";

    // Always show only the first selected item
    const [firstTicker, firstDate] = selected[0].split("|");
    const firstLabel = `${firstTicker} (${new Date(
      firstDate
    ).toLocaleDateString()})`;

    if (selected.length === 1) {
      return firstLabel;
    }

    // If more than one, show first + count
    return `${firstLabel}, +${selected.length - 1}`;
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Box display="flex" flexDirection="column" gap={2} sx={{ width: 350 }}>
          {/* Dropdown select */}
          <FormControl fullWidth>
            <InputLabel>Select Deals</InputLabel>
            <Select
              multiple
              value={selected}
              onChange={handleChange}
              input={<OutlinedInput label="Select Deals" />}
              renderValue={getSelectedLabel} // Custom render value
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
              ) : options.length > 0 ? (
                options.map((item, idx) => {
                  const value = `${item.ticker}|${item.pricing_date}`;
                  return (
                    <MenuItem key={idx} value={value}>
                      <Checkbox checked={selected.indexOf(value) > -1} />
                      <ListItemText
                        primary={
                          <Typography fontWeight="bold">{item.ticker}</Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {new Date(item.pricing_date).toLocaleDateString()}
                          </Typography>
                        }
                      />
                    </MenuItem>
                  );
                })
              ) : (
                <MenuItem disabled>No results found</MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default UnifiedDealSelector;
