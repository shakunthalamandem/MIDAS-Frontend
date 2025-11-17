import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  Typography,
  Autocomplete,
  Container,
} from "@mui/material";
import ABBModelResponseData from "./ABBModelResponseData";
import {
  blockDealFields,
  discountFields,
  yesNoOptions,
} from "./DiscountDataModel/ABBDiscountConfig";

const gridItemProps = { xs: 12, sm: 6, md: 3 };
const inputLabelSx = { color: "#1d2b54", fontWeight: 600 };
const baseTextFieldProps = {
  variant: "standard" as const, // Explicitly cast to the correct type
  fullWidth: true,
  InputLabelProps: {
    shrink: true,
    sx: inputLabelSx,
  },
};

const ABBModelMain = () => {
  const [formValues, setFormValues] = useState<any>({
    ticker: "",
    tradeDate: "", // Initialize as string
    cleanUp: "no", // Default value is "no"
    seasoned: "no", // Default value is "no"
    timing: "no", // Default value is "no"
    primary: "no", // Default value is "no"
    emergingMkt: "no", // Default value is "no"
    blockDealShares: 0, // Initialize as number
    blockDealPercentageOfMarketCap: 0, // Initialize as number
    blockDealValueLocal: 0, // Initialize as number
    blockDealValueDollar: 0, // Initialize as number
  });

  const [companyOptions, setCompanyOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [submittedPayload, setSubmittedPayload] = useState<any | null>(null);

  // --------------------------- SEARCH API -----------------------------
  const handleSearch = async (query: string) => {
    if (!query) {
      setCompanyOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${apiUrl}/api/fs_ticker_search/?search=${query}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const data = await res.json();
      setCompanyOptions(data);
    } catch (err) {
      setCompanyOptions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // --------------------------- FIELD HANDLER -----------------------------
  const handleFieldChange = (key: string) => (e: any) => {
    const value = e.target.value;

    // Handle date fields separately
    if (key === "tradeDate") {
      setFormValues((prev: any) => ({
        ...prev,
        [key]: value,
      }));
    }

    // Handle numeric fields
    else if (
      key === "blockDealShares" ||
      key === "blockDealPercentageOfMarketCap" ||
      key === "blockDealValueLocal" ||
      key === "blockDealValueDollar"
    ) {
      setFormValues((prev: any) => ({
        ...prev,
        [key]: parseFloat(value) || 0,
      }));
    }

    // Handle Yes/No boolean fields
    else if (
      key === "cleanUp" ||
      key === "seasoned" ||
      key === "timing" ||
      key === "primary" ||
      key === "emergingMkt"
    ) {
      setFormValues((prev: any) => ({
        ...prev,
        [key]: value === "yes", // Convert "yes"/"no" into boolean values
      }));
    }

    // Default for string fields
    else {
      setFormValues((prev: any) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  // --------------------------- SUBMIT -----------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ticker: formValues.ticker,
      trade_date: formValues.tradeDate,
      launch_date: formValues.tradeDate, // Assuming launch date is the same as trade date
      clean_up: formValues.cleanUp,
      seasoned: formValues.seasoned,
      timing: formValues.timing,
      primary: formValues.primary,
      emerging_mkt: formValues.emergingMkt,
      block_deal_shares: formValues.blockDealShares,
      block_deal_percentage_of_market_cap: formValues.blockDealPercentageOfMarketCap,
      block_deal_value_in_local_currency: formValues.blockDealValueLocal,
      block_deal_value_in_dollar: formValues.blockDealValueDollar,
    };

    setSubmittedPayload(payload); // Send payload to child
  };

  // --------------------------- RESET -----------------------------
  const handleReset = () => {
    setFormValues({
      ticker: "",
      tradeDate: "",
      cleanUp: "no", // Reset default value to "no"
      seasoned: "no", // Reset default value to "no"
      timing: "no", // Reset default value to "no"
      primary: "no", // Reset default value to "no"
      emergingMkt: "no", // Reset default value to "no"
      blockDealShares: 0,
      blockDealPercentageOfMarketCap: 0,
      blockDealValueLocal: 0,
      blockDealValueDollar: 0,
    });
    setSubmittedPayload(null);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Card
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            boxShadow: "0 12px 50px rgba(9, 30, 66, 0.08)",
            background: "linear-gradient(135deg, #f5f9ff 0%, #e0efff 100%)",
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
                gap: 2,
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#0b2b57" }}
              >
                ABB Discount Data
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#285384", fontWeight: 500 }}
              >
                Provide the inputs below and submit for ABB scoring.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* ----------------- COMPANY AUTOCOMPLETE ----------------- */}
                <Grid item {...gridItemProps}>
                  <Autocomplete
                    options={companyOptions}
                    loading={searchLoading}
                    getOptionLabel={(opt: any) => `${opt.ticker} - ${opt.name}`}
                    onInputChange={(e, value) => handleSearch(value)}
                    onChange={(e, value: any) =>
                      setFormValues((prev: any) => ({
                        ...prev,
                        ticker: value ? value.ticker : "",
                      }))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Ticker *"
                        variant="standard"
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                          sx: inputLabelSx,
                        }}
                        required
                      />
                    )}
                  />
                </Grid>

                {/* ----------------- DATE FIELD ----------------- */}
                <Grid item {...gridItemProps}>
                  <TextField
                    type="date"
                    label="Launch Date *"
                    value={formValues.tradeDate}
                    onChange={handleFieldChange("tradeDate")}
                    {...baseTextFieldProps}
                    required
                  />
                </Grid>

                {/* ----------------- YES/NO FIELDS ----------------- */}
                {discountFields.map((field) => (
                  <Grid item {...gridItemProps} key={field.key}>
                    <TextField
                      select
                      label={field.label}
                      value={formValues[field.key]}
                      onChange={handleFieldChange(field.key)}
                      {...baseTextFieldProps}
                      required
                    >
                      {yesNoOptions.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                ))}

                {/* ----------------- BLOCK DEAL FIELDS ----------------- */}
                {blockDealFields.map((field) => (
                  <Grid item {...gridItemProps} key={field.key}>
                    <TextField
                      type="number"
                      label={field.label}
                      value={formValues[field.key]}
                      onChange={handleFieldChange(field.key)}
                      {...baseTextFieldProps}
                      required={field.key === "blockDealShares"}
                    />
                  </Grid>
                ))}

                {/* ----------------- BUTTONS ----------------- */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Button
                      variant="outlined"
                      type="button"
                      onClick={handleReset}
                      sx={{
                        borderRadius: "18px",
                        px: 3.5,
                        color: "#0b2b57",
                        borderColor: "rgba(11,43,87,0.4)",
                        fontWeight: 600,
                      }}
                    >
                      Reset
                    </Button>

                    <Button
                      variant="contained"
                      type="submit"
                      sx={{
                        borderRadius: "18px",
                        px: 3.5,
                        background: "#0b2b57",
                        fontWeight: 600,
                        color: "#fff",
                      }}
                    >
                      Get Estimate Discount{" "}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* ----------------- RESPONSE COMPONENT ----------------- */}
        {submittedPayload && (
          <Box sx={{ mt: 3 }}>
            <ABBModelResponseData payload={submittedPayload} />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ABBModelMain;
