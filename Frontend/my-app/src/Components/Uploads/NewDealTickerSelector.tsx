import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const NewDealTickerSelector: React.FC = () => {
  const [tickers, setTickers] = useState<string[]>([]);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  useEffect(() => {
    const fetchTickers = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/newdeal_tickers/", {
          headers: {
            Authorization: "Bearer YOUR_TOKEN_HERE", // Replace with actual token or use interceptor
          },
        });
        const data = await response.json();
        setTickers(data.distinct_tickers || []);
      } catch (error) {
        console.error("Error fetching tickers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickers();
  }, []);

  const handleSubmit = () => {
    const payload = {
      tickers: selectedTickers,
      date: selectedDate ? selectedDate.toISOString().split("T")[0] : null,
    };
    console.log("Submitted JSON:", payload);
    setSubmittedData(payload);
    // Optionally: Send payload to backend
  };

  return (
    <Box p={4} maxWidth={500}>
      <Typography variant="h6" gutterBottom>
        Select Tickers and Date
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <FormControl fullWidth margin="normal">
            <InputLabel id="ticker-label">Tickers</InputLabel>
            <Select
              labelId="ticker-label"
              multiple
              value={selectedTickers}
              onChange={(e) => setSelectedTickers(e.target.value as string[])}
              input={<OutlinedInput label="Tickers" />}
              renderValue={(selected) => selected.join(", ")}
              MenuProps={MenuProps}
            >
              {tickers.map((ticker) => (
                <MenuItem key={ticker} value={ticker}>
                  <Checkbox checked={selectedTickers.indexOf(ticker) > -1} />
                  <ListItemText primary={ticker} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {/* <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={(newDate) => setSelectedDate(newDate)}
              renderInput={(params) => (
                <TextField fullWidth margin="normal" {...params} />
              )}
            /> */}
          </LocalizationProvider>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            sx={{ mt: 2 }}
          >
            Submit
          </Button>

          {submittedData && (
            <Box mt={3}>
              <Typography variant="subtitle1">Submitted JSON:</Typography>
              <pre>{JSON.stringify(submittedData, null, 2)}</pre>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default NewDealTickerSelector;
