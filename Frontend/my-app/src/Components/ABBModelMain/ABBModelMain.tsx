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
  DiscountFormValues,
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

const blockDealFieldKeys: Array<keyof DiscountFormValues> = blockDealFields.map(
  (field) => field.key
);

const getInitialFormValues = () => ({
  ticker: "",
  tradeDate: "",
  cleanUp: "No",
  seasoned: "No",
  timing: "No",
  primary: "No",
  emergingMkt: "No",
  blockDealShares: "0",
  blockDealPercentageOfMarketCap: "0",
  blockDealValueLocal: "0",
  blockDealValueDollar: "0",
});

const hasBlockValue = (value: string | number) => {
  if (value === "" || value === null || value === undefined) {
    return false;
  }

  const numericValue = Number(value);
  return !Number.isNaN(numericValue) && numericValue !== 0;
};

const parseBlockValue = (value: string | number) => {
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? 0 : numericValue;
};

const ABBModelMain = () => {
  const [formValues, setFormValues] = useState<any>(getInitialFormValues());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
  const handleFieldChange = (key: keyof DiscountFormValues) => (e: any) => {
    const value = e.target.value;

    setFormValues((prev: any) => {
      const updatedValue = blockDealFieldKeys.includes(key)
        ? value === ""
          ? ""
          : value
        : value;

      const updatedFormValues = {
        ...prev,
        [key]: updatedValue,
      };

      setFormErrors((prevErrors) => {
        if (!prevErrors || Object.keys(prevErrors).length === 0) {
          return prevErrors;
        }

        const nextErrors = { ...prevErrors };

        if (updatedValue && nextErrors[key]) {
          delete nextErrors[key];
        }

        if (blockDealFieldKeys.includes(key)) {
          const hasAnyBlockValue = blockDealFieldKeys.some((fieldKey) =>
            hasBlockValue(updatedFormValues[fieldKey])
          );

          if (hasAnyBlockValue) {
            blockDealFieldKeys.forEach((fieldKey) => {
              delete nextErrors[fieldKey];
            });
          }
        }

        return nextErrors;
      });

      return updatedFormValues;
    });
  };

  // --------------------------- SUBMIT -----------------------------
  const mapYesNoToBool = (value: string) => value === "Yes";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors: Record<string, string> = {};

    if (!formValues.ticker) {
      validationErrors.ticker = "Ticker is required";
    }

    if (!formValues.tradeDate) {
      validationErrors.tradeDate = "Launch date is required";
    }

    const hasAnyBlockValue = blockDealFieldKeys.some((key) =>
      hasBlockValue(formValues[key])
    );

    if (!hasAnyBlockValue) {
      blockDealFieldKeys.forEach((key) => {
        validationErrors[key] = "Enter at least one block deal value";
      });
    }

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setFormErrors({});

    const payload = {
      ticker: formValues.ticker,
      trade_date: formValues.tradeDate,
      launch_date: formValues.tradeDate, // Assuming launch date is the same as trade date
      clean_up: mapYesNoToBool(formValues.cleanUp),
      seasoned: mapYesNoToBool(formValues.seasoned),
      timing: mapYesNoToBool(formValues.timing),
      primary: mapYesNoToBool(formValues.primary),
      emerging_mkt: mapYesNoToBool(formValues.emergingMkt),
      block_deal_shares: parseBlockValue(formValues.blockDealShares),
      block_deal_percentage_of_market_cap: parseBlockValue(
        formValues.blockDealPercentageOfMarketCap
      ),
      block_deal_value_in_local_currency: parseBlockValue(
        formValues.blockDealValueLocal
      ),
      block_deal_value_in_dollar: parseBlockValue(
        formValues.blockDealValueDollar
      ),
    };

    setSubmittedPayload(payload); // Send payload to child
  };

  // --------------------------- RESET -----------------------------
  const handleReset = () => {
    setFormValues(getInitialFormValues());
    setFormErrors({});
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

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={3}>
                {/* ----------------- COMPANY AUTOCOMPLETE ----------------- */}
                <Grid item {...gridItemProps}>
                  <Autocomplete
                    options={companyOptions}
                    loading={searchLoading}
                    getOptionLabel={(opt: any) => `${opt.ticker} - ${opt.name}`}
                    onInputChange={(e, value) => handleSearch(value)}
                    onChange={(e, value: any) =>
                      setFormValues((prev: any) => {
                        const updatedFormValues = {
                          ...prev,
                          ticker: value ? value.ticker : "",
                        };

                        if (value?.ticker) {
                          setFormErrors((prevErrors) => {
                            if (!prevErrors.ticker) {
                              return prevErrors;
                            }
                            const nextErrors = { ...prevErrors };
                            delete nextErrors.ticker;
                            return nextErrors;
                          });
                        }

                        return updatedFormValues;
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Ticker "
                        variant="standard"
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                          sx: inputLabelSx,
                        }}
                        required
                        error={Boolean(formErrors.ticker)}
                        helperText={formErrors.ticker || ""}
                      />
                    )}
                  />
                </Grid>

                {/* ----------------- DATE FIELD ----------------- */}
                <Grid item {...gridItemProps}>
                  <TextField
                    type="date"
                    label="Launch Date"
                    value={formValues.tradeDate}
                    onChange={handleFieldChange("tradeDate")}
                    {...baseTextFieldProps}
                    required
                    error={Boolean(formErrors.tradeDate)}
                    helperText={formErrors.tradeDate || ""}
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
                      required
                      error={Boolean(formErrors[field.key])}
                      helperText={formErrors[field.key] || ""}
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
