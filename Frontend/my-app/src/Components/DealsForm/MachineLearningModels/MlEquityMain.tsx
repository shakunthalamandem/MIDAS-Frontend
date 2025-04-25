import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Grid,
  Container,
} from "@mui/material";
import axios from "axios";

type DealType = "IPO" | "FO";
type Region = "US" | "Non-US " | "APAC" | "EMEA";
type Target = "T1D" | "T1M";

type FormDataType = {
  [key: string]: string;
};

type PredictionResult = {
  prediction: string;
  lower_bound: string;
  upper_bound: string;
};

const IPO_FIELDS = [
  "deal_size_category",
  "percentage_primary_category",
  "allocation_deal_size_percentage_category",
  "allocation_percentage_category",
  "issue_offer_price_category",
  "number_of_shares_offered_category",
  "allocation_price_category",
  "allocated_shares_category",
  "subscription_bid_shares_category",
  "total_shares_offered_category",
  "selected_bank_category",
  "sponsor_yn_category",
  "sector_category",
];

const FO_FIELDS = [
  "deal_size_category",
  "sponsor_yn_category",
  "discount_from_announcement_price_category",
  "percentage_primary_category",
  "allocation_deal_size_percentage_category",
  "allocation_percentage_category",
  "selected_bank_category",
  "sector_category",
];

const sponsorOptions = ["Y", "N", "0"];
const bankOptions = [
  "Barclays",
  "Goldman Sachs",
  "Citigroup Global Markets Inc",
  "Others",
  "UBS",
  "Bank of America",
  "Credit Suisse",
  "JPMorgan",
  "No Bank",
  "Stifel",
  "Jefferies LLC",
  "Morgan Stanley",
  "Deutsche Bank",
  "Robert W Baird & Co",
  "William Blair & Co LLC",
  "RBC Capital Markets",
  "Needham & Co LLC",
  "Oppenheimer & Co Inc",
  "Leerink Partners LLC",
  "Canaccord Genuity",
  "Raymond James & Associates Inc",
  "BMO Capital Markets",
  "Lazard Capital Markets",
  "Cowen & Company LLC",
  "SunTrust Robinson Humphrey Inc",
  "JMP Securities LLC",
  "Commerzbank Group",
  "ABN AMRO Bank",
  "SG Corporate & Investment Banking",
  "Nomura Securities Co Ltd",
  "TD Securities Inc",
  "CIBC World Markets",
  "BNP Paribas",
  "HSBC",
  "Keefe Bruyette & Woods",
  "SVB Securities LLC",
  "Evercore Inc",
];

const sectorOptions = [
  { value: "sp500_information_technology", label: "Information Technology" },
  { value: "sp500_technology", label: "Technology" },
  { value: "sp500_healthcare", label: "Healthcare" },
  { value: "sp500_financials", label: "Financials" },
  { value: "sp500_energy", label: "Energy" },
  { value: "sp500_consumer_discretionary", label: "Consumer Discretionary" },
  { value: "sp500_consumer_staples", label: "Consumer Staples" },
  { value: "sp500_industrials", label: "Industrials" },
  { value: "sp500_materials", label: "Materials" },
  { value: "sp500_real_estate", label: "Real Estate" },
  { value: "sp500_utilities", label: "Utilities" },
  { value: "sp500_oil_gas", label: "Oil & Gas" },
  { value: "sp500_insurance_industry", label: "Insurance Industry" },
  { value: "sp500_telecom_services", label: "Telecom Services" },
];

const MlEquityMain: React.FC = () => {
  const [dealType, setDealType] = useState<DealType>("IPO");
  const [region, setRegion] = useState<Region>("US");
  const [target, setTarget] = useState<Target>("T1D");
  const [formData, setFormData] = useState<FormDataType>({});
  const [result, setResult] = useState<PredictionResult | null>(null);

  const fields = dealType === "IPO" ? IPO_FIELDS : FO_FIELDS;

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePredict = async () => {
    try {
      const payload = {
        deal_type: dealType,
        region,
        target,
        ...formData,
      };

      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(
        `${apiUrl}/api/model_prediction/`,
        payload
      );

      setResult(response.data as PredictionResult);
    } catch (error) {
      console.error("Prediction failed:", error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box py={5} display="flex" flexDirection="column" alignItems="center">
        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          textAlign="center"
          color="#002060"
        >
          ML Equity Predictor
        </Typography>
        <Card
          sx={{
            margin: "0 auto",
            width: "100%",
            padding: 2,
            boxShadow: 3,
            borderRadius: 2,
            marginBottom: 4,
          }}
        >
          <CardContent>
            <Grid container spacing={2}>
              {/* Deal Type */}
              <Grid item xs={12} sm={3}>
                <FormControl
                  sx={{
                    "& .MuiInputBase-root": {
                      height: 40,
                      width: "200px",
                    },
                    "& .MuiInputLabel-root": {
                      top: -5,
                    },
                  }}
                >
                  <InputLabel>Deal Type</InputLabel>
                  <Select
                    value={dealType}
                    onChange={(e) => setDealType(e.target.value as DealType)}
                    label="Deal Type"
                  >
                    <MenuItem value="IPO">IPO</MenuItem>
                    <MenuItem value="FO">FO</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Region */}
              <Grid item xs={12} sm={3}>
                <FormControl
                  sx={{
                    "& .MuiInputBase-root": {
                      height: 40,
                      width: "200px",
                    },
                    "& .MuiInputLabel-root": {
                      top: -5,
                    },
                  }}
                >
                  <InputLabel>Region</InputLabel>
                  <Select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as Region)}
                    label="Region"
                  >
                    <MenuItem value="US">US</MenuItem>
                    <MenuItem value="Non-US">Non-US</MenuItem>
                    <MenuItem value="APAC">APAC</MenuItem>
                    <MenuItem value="EMEA">EMEA</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Target */}
              <Grid item xs={12} sm={3}>
                <FormControl
                  sx={{
                    "& .MuiInputBase-root": {
                      height: 40,
                      width: "200px",
                    },
                    "& .MuiInputLabel-root": {
                      top: -5,
                    },
                  }}
                >
                  <InputLabel>Target</InputLabel>
                  <Select
                    value={target}
                    onChange={(e) => setTarget(e.target.value as Target)}
                    label="Target"
                  >
                    <MenuItem value="T1M">T+1 Month Return</MenuItem>
                    <MenuItem value="T1D">T+1 Day Return</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Form Inputs (4 items per row) */}
        <Card
          sx={{
            margin: "0 auto",
            width: "100%",
            padding: 2,
            boxShadow: 3,
            borderRadius: 2,
            marginBottom: 4,
          }}
        >
          <CardContent>
            <Grid container spacing={2} mb={4}>
              {fields.map((key, index) => {
                const label = key.replace(/_/g, " ");
                let options:
                  | string[]
                  | { value: string; label: string }[]
                  | null = null;

                if (key === "sponsor_yn_category") options = sponsorOptions;
                else if (key === "selected_bank_category")
                  options = bankOptions;
                else if (key === "sector_category") options = sectorOptions;

                return (
                  <Grid item xs={12} sm={6} md={3} key={key}>
                    <FormControl fullWidth>
                      {options && <InputLabel>{label}</InputLabel>}
                      {options ? (
                        <Select
                          value={formData[key] ?? ""}
                          onChange={(e) =>
                            handleInputChange(key, e.target.value)
                          }
                          label={label}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 200,
                                overflowY: "auto",
                              },
                            },
                          }}
                        >
                          {options.map((option) => (
                            <MenuItem
                              value={
                                typeof option === "string"
                                  ? option
                                  : option.value
                              }
                              key={
                                typeof option === "string"
                                  ? option
                                  : option.value
                              }
                            >
                              {typeof option === "string"
                                ? option
                                : option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      ) : (
                        <TextField
                          label={label}
                          value={formData[key] ?? ""}
                          onChange={(e) =>
                            handleInputChange(key, e.target.value)
                          }
                          variant="outlined"
                          fullWidth
                        />
                      )}
                    </FormControl>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>

        {/* Predict Button */}
        <Box mb={4}>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#002060" }}
            onClick={handlePredict}
            size="large"
          >
            Predict
          </Button>
        </Box>

        {/* Result */}
        {result && (
          <Card variant="outlined" sx={{ width: "100%", textAlign: "center" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="#002060">
                Prediction Result
              </Typography>
              <Typography style={{ display: "inline", marginRight: "10px" }}>
                <strong>Prediction:</strong> {result.prediction}
              </Typography>
              <Typography style={{ display: "inline", marginRight: "10px" }}>
                <strong>Lower Bound:</strong> {result.lower_bound}
              </Typography>
              <Typography style={{ display: "inline" }}>
                <strong>Upper Bound:</strong> {result.upper_bound}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default MlEquityMain;
