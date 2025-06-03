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
      date: date?.toISOString().split("T")[0],
      ticker,
      company_name: companyName,
      expected_date: expectedDate?.toISOString().split("T")[0],
      lowprice: lowprice,
        highprice: highprice,
      exchange,
      offer_amount: offerAmount,
    };

    try {
      const response = await fetch(`${apiUrl}/api/ai_insights_upload/`, {
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
    >
      <Card
        elevation={6}
        sx={{ maxWidth: 600, mx: "auto", mt: 5, p: 3, borderRadius: 4 }}
      >
        <CardContent>
          <Typography variant="h5" color="#002060" gutterBottom align="center">
            IPO Dashboard Calendar
          </Typography>
          <Stack spacing={3}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              value={date ? date.toISOString().split("T")[0] : ""}
              onChange={(e) => {
                const newDate = e.target.value ? new Date(e.target.value) : null;
                setDate(newDate);
              }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Ticker"
              variant="outlined"
              fullWidth
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
            />

            <TextField
              label="Company Name"
              variant="outlined"
              fullWidth
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />

            <TextField
              label="Expected Date"
              type="date"
              fullWidth
              value={expectedDate ? expectedDate.toISOString().split("T")[0] : ""}
              onChange={(e) => {
                const newExpectedDate = e.target.value ? new Date(e.target.value) : null;
                setExpectedDate(newExpectedDate);
              }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="LowPrice "
              variant="outlined"
              fullWidth
              value={lowprice}
              onChange={(e) => setLowPrice(e.target.value)}
            />
               <TextField
              label="HighPrice"
              variant="outlined"
              fullWidth
              value={highprice}
              onChange={(e) => setHighPrice(e.target.value)}
            />

            <TextField
              label="Exchange"
              variant="outlined"
              fullWidth
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
            />

            <TextField
              label="Offer Amount"
              variant="outlined"
              fullWidth
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
            />

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{ color: "#fff", backgroundColor: "#002060" }}
              >
                Submit
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleReset}
              >
                Reset
              </Button>
            </Box>

            {submitted && (
              <Slide direction="up" in={submitted} mountOnEnter unmountOnExit>
                <Typography variant="body1" color="success.main">
                  Form submitted successfully!
                </Typography>
              </Slide>
            )}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default IpoDashboardCalendar;
