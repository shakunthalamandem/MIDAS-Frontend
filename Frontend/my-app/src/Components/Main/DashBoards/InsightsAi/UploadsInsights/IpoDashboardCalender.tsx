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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid, // Added Grid for a more flexible layout
} from "@mui/material";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles"; // Added styled for custom components

const region_list = ['US', 'EMEA', 'APAC', 'Non-Us'];
const sector_list = [
  "Health Care",
  "Information Technology",
  "Financials",
  "Consumer Staples",
  "Real Estate",
  "Industrials",
  "Materials",
  "Energy",
  "Utilities",
  "Consumer Discretionary",
  "Communication Services"
];

// Styled components for a cleaner look
const FormWrapper = styled(motion.div)(({ theme }) => ({
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(2),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 600,
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[4],
}));

const IpoDashboardCalendar: React.FC = () => {
  const [date, setDate] = useState<Date | null>(null);
  const [ticker, setTicker] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [expectedDate, setExpectedDate] = useState<Date | null>(null);
  const [lowprice, setLowPrice] = useState("");
  const [highprice, setHighPrice] = useState("");
  const [exchange, setExchange] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const [region, setRegion] = useState("");
  const [sector, setSector] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    if (!apiUrl) {
      console.error("API URL is not defined in environment variables");
      return;
    }

    const payload = {
      "uploaded date": date?.toISOString().split("T")[0],
      "ticker": ticker,
      "company name": companyName,
      "expected date": expectedDate?.toISOString().split("T")[0],
      "minimun price": lowprice || null,
      "maximum price": highprice || null,
      "exchange": exchange,
      "offer amount": offerAmount || null,
      "region": region,
      "sector": sector,
    };

    // Simple client-side validation
    if (!ticker || !companyName || !expectedDate || !region || !sector) {
      alert("Please fill out all required fields.");
      return;
    }

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
      setTimeout(() => setSubmitted(false), 3000); // Hide success message after 3 seconds
      handleReset(); // Reset form after successful submission
    } catch (error) {
      alert("Form submission failed. Please try again.");
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
    setRegion("");
    setSector("");
  };

  return (
    <FormWrapper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <StyledCard>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            component="h1"
            color="#002060"
            gutterBottom
            align="center"
            sx={{ fontWeight: 700, mb: 3 }}
          >
            Upcoming IPO Entry 📝
          </Typography>

          <Stack spacing={3}>
            {/* Input fields on a single line */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ticker"
                  fullWidth
                  required
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  size="small"
                  placeholder="e.g., TSLA"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Company Name"
                  fullWidth
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  size="small"
                  placeholder="e.g., Tesla Inc."
                />
              </Grid>
            </Grid>

            {/* Date pickers on a single line */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Upload Date"
                  type="date"
                  fullWidth
                  value={date ? date.toISOString().split("T")[0] : ""}
                  onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Expected IPO Date"
                  type="date"
                  fullWidth
                  required
                  value={expectedDate ? expectedDate.toISOString().split("T")[0] : ""}
                  onChange={(e) =>
                    setExpectedDate(e.target.value ? new Date(e.target.value) : null)
                  }
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Price fields on a single line */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Minimum Price"
                  fullWidth
                  value={lowprice}
                  onChange={(e) => setLowPrice(e.target.value)}
                  size="small"
                  type="number"
                  placeholder="e.g., 20.50"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Maximum Price"
                  fullWidth
                  value={highprice}
                  onChange={(e) => setHighPrice(e.target.value)}
                  size="small"
                  type="number"
                  placeholder="e.g., 25.00"
                />
              </Grid>
            </Grid>
            
            {/* Exchange and Offer Amount on a single line */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Exchange"
                  fullWidth
                  value={exchange}
                  onChange={(e) => setExchange(e.target.value)}
                  size="small"
                  placeholder="e.g., NASDAQ"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Offer Amount ($M)"
                  fullWidth
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  size="small"
                  type="number"
                  placeholder="e.g., 500"
                />
              </Grid>
            </Grid>

            {/* Dropdowns on a single line */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Region</InputLabel>
                  <Select
                    value={region}
                    label="Region"
                    onChange={(e) => setRegion(e.target.value as string)}
                  >
                    {region_list.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Sector</InputLabel>
                  <Select
                    value={sector}
                    label="Sector"
                    onChange={(e) => setSector(e.target.value as string)}
                    // Add the MenuProps prop to control the dropdown menu's styling
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200, // Set a max-height, e.g., 200px
                          overflowY: 'auto', // Enable vertical scrolling
                        },
                      },
                    }}
                  >
                    {sector_list.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleReset}
                size="small"
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{ backgroundColor: "#002060", color: "#fff" }}
                size="small"
              >
                Submit
              </Button>
            </Box>

            {submitted && (
              <Slide direction="up" in={submitted} mountOnEnter unmountOnExit>
                <Typography variant="body2" color="success.main" align="center" mt={2}>
                  Form submitted successfully! ✨
                </Typography>
              </Slide>
            )}
          </Stack>
        </CardContent>
      </StyledCard>
    </FormWrapper>
  );
};

export default IpoDashboardCalendar;