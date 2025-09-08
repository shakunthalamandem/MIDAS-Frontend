import React from "react";
import {
  Grid,
  TextField,
  Typography,
  MenuItem,
  Box,
} from "@mui/material";
import { FormSectionProps } from "../../../types/NewDealFormData";
import DatasetIcon from "@mui/icons-material/Dataset";

// Utility to format date
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`; // DD-MM-YYYY
};


const DealInformation: React.FC<FormSectionProps> = ({
  data,
  editable,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "text" ? value.toUpperCase() : value;
    onChange({ ...data, [name]: newValue });
  };

  const regions = ["US", "EMEA", "APAC", "Non-US America"];
  const dealTypes = ["IPO", "FO"];
  const foTypes = ["Marketed", "Overnight", "Block"];
  const sectors = [
    "Health Care",
    "Information Technology",
    "Financials",
    "Consumer Staples",
    "Real Estate",
    "Materials",
    "Industrials",
    "Energy",
    "Utilities",
    "Consumer Discretionary",
    "Communication Services",
  ];
  const dealCaptains = ["Robin", "Tom", "Block", "HC", "Jay", "Mike", "ECM Other", "Others"];
  const invitationBanks = [
    "ABN AMRO Bank",
    "Bank of America",
    "Barclays",
    "BMO Capital Markets",
    "BNP Paribas",
    "Canaccord Genuity",
    "CIBC World Markets",
    "Citigroup Global Markets Inc",
    "Commerzbank Group",
    "Cowen & Company LLC",
    "Credit Suisse",
    "Deutsche Bank",
    "Evercore Inc",
    "Goldman Sachs",
    "HSBC",
    "Jefferies LLC",
    "JMP Securities LLC",
    "JPMorgan",
    "Keefe Bruyette & Woods",
    "Lazard Capital Markets",
    "Leerink Partners LLC",
    "Morgan Stanley",
    "Needham & Co LLC",
    "Nomura Securities Co Ltd",
    "Oppenheimer & Co Inc",
    "Raymond James & Associates Inc",
    "RBC Capital Markets",
    "Robert W Baird & Co",
    "SG Corporate & Investment Banking",
    "Stifel",
    "SunTrust Robinson Humphrey Inc",
    "SVB Securities LLC",
    "TD Securities Inc",
    "UBS",
    "William Blair & Co LLC",
    "Others",
  ];

  const sponsors = ["Y", "N"];
  const deal_stats = ["Announced", "Priced","Issued"];

const renderSelectField = (
  label: string,
  name: string,
  options: string[]
) => (
  <Grid item xs={12} sm={6} md={4}>
    <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
      {label}
    </Typography>
    <TextField
      select
      name={name}
      value={data[name] || ""}
      onChange={handleChange}
      fullWidth
      size="small"
      variant="standard"
      disabled={!editable}
      InputProps={{
        disableUnderline: !editable,
        sx: {
          "&.Mui-disabled": {
            WebkitTextFillColor: "#b1062e",
          },
          "& input.Mui-disabled": {
            WebkitTextFillColor: "#b1062e",
          },
          "& .MuiSelect-select.Mui-disabled": {
            WebkitTextFillColor: "#b1062e",
          },
          "& .MuiSelect-icon": !editable ? { display: "none" } : {},
        },
      }}
      SelectProps={{
        MenuProps: {
          PaperProps: {
            style: {
              maxHeight: 400,
            },
          },
        },
      }}
    >
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  </Grid>
);


  const renderTextField = (
    label: string,
    name: string,
    type: string = "text",
    overrideValue?: string,
    readOnly: boolean = false
  ) => (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
        {label}
      </Typography>
      <TextField
        name={name}
        type={type}
        value={overrideValue !== undefined ? overrideValue : data[name] || ""}
        onChange={readOnly ? undefined : handleChange}
        fullWidth
        size="small"
        variant="standard"
        disabled={!editable || readOnly}
        InputProps={{
          disableUnderline: !editable || readOnly,
          sx: {
            "&.Mui-disabled": {
              WebkitTextFillColor: "#b1062e",
            },
            "& input.Mui-disabled": {
              WebkitTextFillColor: "#b1062e",
            },
          },
        }}
      />
    </Grid>
  );

  // Derived value for Pricing Date Status
  const pricingDateStatus = data["pricing_date"]
    ? formatDate(data["pricing_date"])
    : "TBA";

  return (
    <>
      <Typography
        variant="h6"
        gutterBottom
        align="center"
        color="#002060"
        fontWeight={600}
      >
        <Box display="inline-flex" alignItems="center" gap={1}>
          <DatasetIcon />
          Deal Information
        </Box>
      </Typography>

      <Grid container spacing={2}>
        {renderTextField("Ticker", "ticker")}
        {renderTextField("Pricing Date Status", "pricing_date_status", "text", pricingDateStatus, true)}
        {renderTextField("Pricing Date", "pricing_date", "date")}
        {renderTextField("Vendor/Issuer", "issuer_name")}
        {renderSelectField("Region", "region", regions)}
        {renderSelectField("Deal Type", "deal_type", dealTypes)}
        {renderSelectField("FO Type", "fo_type", foTypes)}
        {renderSelectField("Sector", "sector", sectors)}
        {renderSelectField("Deal Captain", "deal_captain", dealCaptains)}
        {renderSelectField("Lead Bank", "lead_bank", invitationBanks)}
        
        {renderSelectField("Sponsor", "sponsor", sponsors)}
        {renderSelectField("Deal Stats", "deal_stats", deal_stats)}
      </Grid>
    </>
  );
};

export default DealInformation;
