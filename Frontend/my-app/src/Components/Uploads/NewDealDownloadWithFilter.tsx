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
  Typography,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Container,
  Chip,
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

const NewDealDownloadWithFilter: React.FC = () => {
  const [tickers, setTickers] = useState<string[]>([]);
  const [selectedDealId, setselectedDealId] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

  useEffect(() => {
    const fetchTickers = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

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
      } catch (err) {
        console.error("Error fetching tickers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickers();
  }, []);

  const downloadExcelFile = async () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Access token not found. Please log in.");
      return;
    }

    const payload = {
      deal_id: selectedDealId,
    };

    if (!payload.deal_id.length) {
      setError("Please select at least one ticker.");
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/download_deals/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error response:", error);
        setError(error.message || "Download failed.");
        setOpenSnackbar(true);
        return;
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : "matched_deals.xlsx";

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setError("");
      setSnackbarMessage("Excel file downloaded successfully!");
      setOpenSnackbar(true);
    } catch (err) {
      console.error("Download error:", err);
      setError("An error occurred while downloading.");
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom align="center" color="#002060">
        Download New Deals Data
      </Typography>

      <Card sx={{ p: 3, boxShadow: 3 }}>
        <CardContent>
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              {/* Select Dropdown */}
              <FormControl fullWidth margin="normal">
                <InputLabel id="ticker-label">Tickers</InputLabel>
                <Select
                  labelId="ticker-label"
                  multiple
                  value={selectedDealId}
                  onChange={(e) => {
                    const value = e.target.value as string[];

                    if (value.includes("all")) {
                      // If all is selected, toggle between select all / clear all
                      setselectedDealId(
                        selectedDealId.length === tickers.length ? [] : tickers
                      );
                    } else {
                      setselectedDealId(value);
                    }
                  }}
                  input={<OutlinedInput label="Tickers" />}
                  renderValue={(selected) => {
                    if (selected.length === 0) return "";
                    if (selected.length === 1) return selected[0];
                    return `${selected[0]} +${selected.length - 1}`;
                  }}
                  MenuProps={MenuProps}
                >
                  <MenuItem value="all">
                    <Checkbox
                      checked={selectedDealId.length === tickers.length}
                      indeterminate={
                        selectedDealId.length > 0 &&
                        selectedDealId.length < tickers.length
                      }
                    />
                    <ListItemText primary="Select All" />
                  </MenuItem>
                  {tickers.map((ticker) => (
                    <MenuItem key={ticker} value={ticker}>
                      <Checkbox checked={selectedDealId.includes(ticker)} />
                      <ListItemText primary={ticker} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Selected Items as Chips */}
              {selectedDealId.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    mt: 2,
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  {selectedDealId.map((ticker) => (
                    <Chip
                      key={ticker}
                      label={ticker}
                      onDelete={() =>
                        setselectedDealId((prev) =>
                          prev.filter((t) => t !== ticker)
                        )
                      }
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}

              {/* Download Button */}
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={downloadExcelFile}
                sx={{ mt: 3 }}
              >
                Download
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Snackbar for feedback */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error || snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NewDealDownloadWithFilter;
