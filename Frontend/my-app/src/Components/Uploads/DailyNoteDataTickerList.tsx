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
  id: number;
  trade_date: string | null;
  deal_type: string | null;
}

interface DailyNoteDataTickerListProps {
  selected: number[]; // store IDs
  setSelected: (values: number[]) => void;
}

const DailyNoteDataTickerList: React.FC<DailyNoteDataTickerListProps> = ({
  selected,
  setSelected,
}) => {
  const [options, setOptions] = useState<DealOption[]>([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  // Fetch options from API
  useEffect(() => {
    const fetchOptions = async () => {
      if (!apiUrl) return;
      setLoading(true);
      try {
        const resp = await axios.get<DealOption[]>(
          `${apiUrl}/api/daily_note_deals_data/`,
          { headers: { Authorization: token ? `Bearer ${token}` : "" } }
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
  const selectedIds: number[] = event.target.value;
  setSelected(selectedIds); // simply store all selected IDs, no ticker restriction
};
  // Delete chip
  const handleDelete = (id: number) => {
    setSelected(selected.filter((item) => item !== id));
  };

  // Render dropdown label
  const getSelectedLabel = () => {
    if (selected.length === 0) return "";

    const firstOption = options.find((o) => o.id === selected[0]);
    if (!firstOption) return "";

    const firstLabel = `${firstOption.ticker} (${firstOption.trade_date})`;
    return selected.length === 1 ? firstLabel : `${firstLabel}, +${selected.length - 1}`;
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Box display="flex" flexDirection="column" gap={2} sx={{ width: 350 }}>
          {/* Dropdown */}
          <FormControl fullWidth>
            <InputLabel>Select Deals</InputLabel>
            <Select
              multiple
              value={selected}
              onChange={handleChange}
              input={<OutlinedInput label="Select Deals" />}
              renderValue={getSelectedLabel}
              MenuProps={{ PaperProps: { style: { maxHeight: 300, width: 350 } } }}
            >
              {loading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : options.length > 0 ? (
                options.map((item) => {
                  if (!item.trade_date) return null;
                  return (
                    <MenuItem key={item.id} value={item.id}>
                      <Checkbox checked={selected.includes(item.id)} />
                      <ListItemText
                        primary={<Typography fontWeight="bold">{item.ticker}    <span style={{ color: "#007780ff", fontWeight: 400 ,fontSize:'0.8rem' }}>{item.id}</span></Typography>}
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {item.trade_date}{" "}
                            <span style={{ color: "#c40303ff", fontWeight: 600 }}>
                              {item.deal_type}
                            </span>
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

          {/* Chips */}
          {selected.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={1}>
              {selected.map((id) => {
                const option = options.find((o) => o.id === id);
                if (!option) return null;
                return (
                  <Chip
                    key={id}
                    label={`${option.ticker} (${option.trade_date})`}
                    onDelete={() => handleDelete(id)}
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

export default DailyNoteDataTickerList;
