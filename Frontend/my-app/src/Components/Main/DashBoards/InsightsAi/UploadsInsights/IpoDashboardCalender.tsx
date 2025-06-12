import React, { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  Slide,
} from "@mui/material";
import { motion } from "framer-motion";

const IpoDashboardCalendar: React.FC = () => {
  const [date, setDate] = useState<Date | null>(null);
  const [ticker, setTicker] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [expectedDate, setExpectedDate] = useState<Date | null>(null);
  const [lowprice, setLowPrice] = useState("");
  const [highprice, setHighPrice] = useState("");
  const [exchange, setExchange] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    if (!apiUrl) {
    console.error("API URL is not defined in environment variables");
      return;
    }

    const payload = {
    "uploaded date": date?.toISOString().split("T")[0],   // maps to "uploaded date"
      "ticker": ticker,
      "company name": companyName,
      "expected date": expectedDate?.toISOString().split("T")[0],
    "minimun price": lowprice || null,   // Note: backend has typo 'minimun'
      "maximum price": highprice || null,
      "exchange": exchange,
    "offer amount": offerAmount ? parseFloat(offerAmount) : null
    };

    try {
      const response = await fetch(`${apiUrl}/api/upload_ipo_dashboard/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

      setSubmitted(true);
    } catch (error) {
    alert("Form submission failed.");
      console.error(error);
    }
  };

  const handleReset = () => {
    setDate(null);
    setTicker("");
    setCompanyName("");
    setExpectedDate(null);
    setLowPrice("");
    setHighPrice("");
    setExchange("");
    setOfferAmount("");
    setSubmitted(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ height: "100%" }}
    >
      <CardContent
        sx={{
          height: "100%",
          overflowY: "auto",
          px: 2,
          pt: 1,
          pb: 0,
        }}
      >
        <Typography
          variant="h6"
          color="#002060"
          gutterBottom
          align="center"
          sx={{ fontWeight: 600, fontSize: "1.5rem" }}
        >
          IPO Dashboard Calendar
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Date"
            type="date"
            fullWidth
            value={date ? date.toISOString().split("T")[0] : ""}
            onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : null)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="Ticker"
            fullWidth
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            size="small"
          />
          <TextField
            label="Company Name"
            fullWidth
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            size="small"
          />
          <TextField
            label="Expected Date"
            type="date"
            fullWidth
            value={expectedDate ? expectedDate.toISOString().split("T")[0] : ""}
            onChange={(e) =>
              setExpectedDate(e.target.value ? new Date(e.target.value) : null)
            }
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="Minimum Price"
            fullWidth
            value={lowprice}
            onChange={(e) => setLowPrice(e.target.value)}
            size="small"
          />
          <TextField
            label="Maximum Price"
            fullWidth
            value={highprice}
            onChange={(e) => setHighPrice(e.target.value)}
            size="small"
          />
          <TextField
            label="Exchange"
            fullWidth
            value={exchange}
            onChange={(e) => setExchange(e.target.value)}
            size="small"
          />
          <TextField
            label="Offer Amount"
            fullWidth
            value={offerAmount}
            onChange={(e) => setOfferAmount(e.target.value)}
            size="small"
          />

          <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{ backgroundColor: "#002060", color: "#fff" }}
              size="small"
            >
              Submit
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleReset} size="small">
              Reset
            </Button>
          </Box>

          {submitted && (
            <Slide direction="up" in={submitted} mountOnEnter unmountOnExit>
              <Typography variant="body2" color="success.main" align="center">
                Form submitted successfully!
              </Typography>
            </Slide>
          )}
        </Stack>
      </CardContent>
    </motion.div>
  );
};

export default IpoDashboardCalendar;
