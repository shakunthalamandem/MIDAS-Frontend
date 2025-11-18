// Full updated ABBModelMain.tsx with search bar replacing the subtitle text

import React, { useEffect, useState } from "react";
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
  variant: "standard" as const,
  fullWidth: true,
  InputLabelProps: {
    shrink: true,
    sx: inputLabelSx,
  },
};
const selectMenuProps = {
  PaperProps: {
    style: {
      maxHeight: 240,
    },
  },
};

const blockDealFieldKeys: Array<keyof DiscountFormValues> =
  blockDealFields.map((field) => field.key);

const getInitialFormValues = (): DiscountFormValues => ({
  ticker: "",
  tradeDate: "",
  cleanUp: "No",
  seasoned: "No",
  timing: "No",
  primary: "No",
  emergingMkt: "No",
  dealCaptain: "",
  gicsSector: "",
  blockDealShares: "",
  blockDealPercentageOfMarketCap: "",
  blockDealValueLocal: "",
  blockDealValueDollar: "",
});

const hasBlockValue = (value: string | number) => {
  if (value === "" || value === null || value === undefined) return false;
  const numericValue = Number(value);
  return !Number.isNaN(numericValue) && numericValue !== 0;
};

const parseBlockValue = (value: string | number) => {
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? 0 : numericValue;
};

const extractDistinctOptions = (data: any[], key: string): string[] => {
  if (!Array.isArray(data)) return [];
  const matchingEntry = data.find(
    (entry) => entry && typeof entry === "object" && entry[key]
  );
  if (!matchingEntry) return [];
  const config = matchingEntry[key];
  if (config && Array.isArray(config.options)) {
    return config.options.map((option: any) => String(option));
  }
  return [];
};

const ABBModelMain = () => {
  const [formValues, setFormValues] =
    useState<DiscountFormValues>(getInitialFormValues());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [companyOptions, setCompanyOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [dealCaptainOptions, setDealCaptainOptions] = useState<string[]>([]);
  const [sectorOptions, setSectorOptions] = useState<string[]>([]);

  const [submittedPayload, setSubmittedPayload] = useState<any | null>(null);
  const [prefetchedResponse, setPrefetchedResponse] = useState<any | null>(null);

  // New states for top search bar
  const [emeaOptions, setEmeaOptions] = useState<any[]>([]);
  const [emeaLoading, setEmeaLoading] = useState(false);
  const [selectedEmea, setSelectedEmea] = useState<any | null>(null);
  useEffect(() => {
    const fetchAllEmeaData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch(`${apiUrl}/api/get_emeaabb_model_data/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const data = await res.json();
        setEmeaOptions(data);
      } catch (err) {
        console.error("Failed to load EMEA form data", err);
      }
    };

    fetchAllEmeaData();
  }, []);



  // Fetch distinct values
  useEffect(() => {
    const fetchDistinctValues = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) return;

      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${apiUrl}/api/mdd_distinct_values/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch distinct values");

        const data = await response.json();
        const normalizedData = Array.isArray(data)
          ? data
          : data?.screener || [];

        setSectorOptions(extractDistinctOptions(normalizedData, "gics_sector"));
        setDealCaptainOptions(
          extractDistinctOptions(normalizedData, "deal_captain")
        );
      } catch (error) {
        setSectorOptions([]);
        setDealCaptainOptions([]);
      }
    };

    fetchDistinctValues();
  }, []);

  // New: Fetch EMEA tickers for search bar
  const fetchEmeaTickers = async (query: string) => {
    if (!query) {
      setEmeaOptions([]);
      return;
    }

    setEmeaLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const res = await fetch(`${apiUrl}/api/get_emeaabb_model_data/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      let data = await res.json();

      const filtered = data.filter((item: any) =>
        item.ticker.toLowerCase().includes(query.toLowerCase())
      );

      setEmeaOptions(filtered);
    } catch (err) {
      setEmeaOptions([]);
    } finally {
      setEmeaLoading(false);
    }
  };

  // Ticker search
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

  const handleFieldChange = (key: keyof DiscountFormValues) => (e: any) => {
    const value = e.target.value;

    setFormValues((prev: DiscountFormValues) => {
      const updatedValue = blockDealFieldKeys.includes(key)
        ? value === "" ? "" : value
        : value;

      const updatedFormValues = { ...prev, [key]: updatedValue };

      setFormErrors((prevErrors) => {
        if (!prevErrors || Object.keys(prevErrors).length === 0) return prevErrors;
        const nextErrors = { ...prevErrors };

        if (updatedValue && nextErrors[key]) delete nextErrors[key];

        if (blockDealFieldKeys.includes(key)) {
          const hasAnyBlockValue = blockDealFieldKeys.some((fieldKey) =>
            hasBlockValue(updatedFormValues[fieldKey])
          );
          if (hasAnyBlockValue) {
            blockDealFieldKeys.forEach((fieldKey) => delete nextErrors[fieldKey]);
          }
        }

        return nextErrors;
      });

      return updatedFormValues;
    });
  };

  const mapYesNoToBool = (value: string) => value === "Yes";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors: Record<string, string> = {};

    if (!formValues.ticker) validationErrors.ticker = "Ticker is required";
    if (!formValues.tradeDate) validationErrors.tradeDate = "Launch date is required";

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
      launch_date: formValues.tradeDate,
      clean_up: mapYesNoToBool(formValues.cleanUp),
      seasoned: mapYesNoToBool(formValues.seasoned),
      timing: mapYesNoToBool(formValues.timing),
      primary: mapYesNoToBool(formValues.primary),
      emerging_mkt: mapYesNoToBool(formValues.emergingMkt),
      deal_captain: formValues.dealCaptain,
      sector: formValues.gicsSector,
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

    setPrefetchedResponse(null);
    setSubmittedPayload(payload);
  };

  const handleReset = () => {
    setFormValues(getInitialFormValues());
    setFormErrors({});
    setSubmittedPayload(null);
    setPrefetchedResponse(null);
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
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#0b2b57" }}>
                ABB Discount Data
              </Typography>
              <Box sx={{ width: { xs: "100%", md: 350 } }}>
                <Autocomplete
                  options={emeaOptions}
                  loading={emeaLoading}
                  getOptionLabel={(opt: any) =>
                    `${opt.ticker || ""} (${opt.deal_id || "TBA"})`
                  }
                  popupIcon={<></>}
                  onInputChange={(e, value) => fetchEmeaTickers(value)}
                  onChange={async (e, value: any) => {
                    setSelectedEmea(value);

                    if (value) {
                      setPrefetchedResponse(null);

                      // Auto-populate input fields
                      setFormValues((prev) => ({
                        ...prev,
                        ticker: value.ticker,
                        tradeDate: value.launch_date,
                        blockDealShares: value.block_deal_shares,
                        blockDealPercentageOfMarketCap:
                          value.block_deal_percentage_of_market_cap,
                        blockDealValueLocal: value.block_deal_value_in_local_currency,
                        blockDealValueDollar: value.block_deal_value_in_dollar,
                      }));

                      // ⭐ CALL POST API TO FETCH DEAL DATA
                      try {
                        const apiUrl = process.env.REACT_APP_API_URL;
                        const token = localStorage.getItem("access_token");

                        const payloadToSend = {
                          ticker: value.ticker,
                          deal_id: value.deal_id,
                        };

                        const res = await fetch(`${apiUrl}/api/emea_abb_model_data_fetch/`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: token ? `Bearer ${token}` : "",
                          },
                          body: JSON.stringify(payloadToSend),
                        });

                        const responseData = await res.json();

                        setSubmittedPayload(null);
                        setPrefetchedResponse(responseData);
                      } catch (err) {
                        console.error("EMEA fetch failed:", err);
                        setPrefetchedResponse(null);
                      }
                    } else {
                      setPrefetchedResponse(null);
                      setSubmittedPayload(null);
                    }
                  }}


                  // ⭐ CUSTOM OPTION UI
                  renderOption={(props, option: any) => (
                    <li {...props} style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>

                        {/* Line 1 */}
                        <span style={{ fontWeight: 600, fontSize: "14px" }}>
                          {option.ticker}({option.launch_date || "N/A"})
                        </span>

                        {/* Line 2 */}
                        <span style={{ fontSize: "13px", color: "#333" }}>
                          Discount: {option.final_discount ?? "N/A"}%
                        </span>
                      </div>
                    </li>
                  )}

                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search ABB Deals"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <span style={{ marginRight: 8, opacity: 0.7 }}>🔍</span>
                        ),
                        sx: {
                          borderRadius: "10px",
                          paddingY: "2px",
                          backgroundColor: "#fff",
                        },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                        },
                      }}
                    />
                  )}
                />
              </Box>


            </Box>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={3}>
                {/* ----------------- COMPANY AUTOCOMPLETE ----------------- */}
                <Grid item {...gridItemProps}>
                  <Autocomplete
                    options={companyOptions}
                    loading={searchLoading}
                    getOptionLabel={(opt: any) => `${opt.ticker}`}
                    onInputChange={(e, value) => handleSearch(value)}
                    onChange={(e, value: any) =>
                      setFormValues((prev: DiscountFormValues) => {
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

                <Grid item {...gridItemProps}>
                  <TextField
                    select
                    label="Deal Captain"
                    value={formValues.dealCaptain}
                    onChange={handleFieldChange("dealCaptain")}
                    {...baseTextFieldProps}
                    SelectProps={{ MenuProps: selectMenuProps }}
                    required
                    error={Boolean(formErrors.dealCaptain)}
                    helperText={formErrors.dealCaptain || ""}
                  >
                    <MenuItem value="">Select Deal Captain</MenuItem>
                    {dealCaptainOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item {...gridItemProps}>
                  <TextField
                    select
                    label="Sector"
                    value={formValues.gicsSector}
                    onChange={handleFieldChange("gicsSector")}
                    {...baseTextFieldProps}
                    SelectProps={{ MenuProps: selectMenuProps }}
                    required
                    error={Boolean(formErrors.gicsSector)}
                    helperText={formErrors.gicsSector || ""}
                  >
                    <MenuItem value="">Select Sector</MenuItem>
                    {sectorOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

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
        {(submittedPayload || prefetchedResponse) && (
          <Box sx={{ mt: 3 }}>
            <ABBModelResponseData
              payload={submittedPayload}
              prefetchedData={prefetchedResponse}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ABBModelMain;
