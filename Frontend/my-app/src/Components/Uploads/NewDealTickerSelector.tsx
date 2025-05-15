import React, { useEffect, useState } from "react";
import axios from "axios";
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
  const [selectedDate, setSelectedDate] = useState<string>(""); // Store date as string (YYYY-MM-DD)
  const [loading, setLoading] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  useEffect(() => {
    const fetchTickers = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const response = await axios.get<{ distinct_tickers: string[] }>(
          `${apiUrl}/api/newdeal_tickers/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        setTickers(response.data.distinct_tickers || []);
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
      date: selectedDate || null,
    };
    console.log("Submitted JSON:", payload);
    setSubmittedData(payload);
    // Optional: Send payload to backend here
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
                  <Checkbox checked={selectedTickers.includes(ticker)} />
                  <ListItemText primary={ticker} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            variant="outlined"
            size="small"
            label="As Of Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            margin="normal"
          />

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
