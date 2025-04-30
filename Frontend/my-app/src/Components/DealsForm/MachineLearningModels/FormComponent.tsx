import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  TextField,
} from "@mui/material";

type DealType = "IPO" | "FO";
type Region = "US" | "Non-US" | "APAC" | "EMEA";
type Target = "T1D" | "T1M";
type FormDataType = { [key: string]: string };

interface FormComponentProps {
  dealType: DealType;
  setDealType: React.Dispatch<React.SetStateAction<DealType>>;
  region: Region;
  setRegion: React.Dispatch<React.SetStateAction<Region>>;
  target: Target;
  setTarget: React.Dispatch<React.SetStateAction<Target>>;
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  fields: string[];
}

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

// const bankOptions = ["Goldman Sachs", "Morgan Stanley", "JPMorgan", "Citigroup", "Barclays"];

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
  "Evercore Inc"
];
const sponsor_yn_categoryOptions = ["Y", "N", "0"];

const labelMappings: Record<string, string> = {
  deal_size_category: "Deal Size",
  percentage_primary_category: "Percentage Primary",
  allocation_deal_size_percentage_category: "Allocation Deal Size %",
  allocation_percentage_category: "Allocation %",
  issue_offer_price_category: "Issue Offer Price",
  number_of_shares_offered_category: "Number of Shares Offered",
  allocation_price_category: "Allocation Price",
  allocated_shares_category: "Allocated Shares",
  subscription_bid_shares_category: "Subscription Bid Shares",
  total_shares_offered_category: "Total Shares Offered",
  discount_from_announcement_price_category: "Discount From Announcement Price",
  selected_bank_category: "Selected Bank",
  sponsor_yn_category: "Sponsor (Y/N)",
  sector_category: "Sector",
};

const FormComponent: React.FC<FormComponentProps> = ({
  dealType,
  setDealType,
  region,
  setRegion,
  target,
  setTarget,
  formData,
  setFormData,
  fields,
}) => {
  const handleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const renderInputField = (item: { key: string; label: string }) => {
    switch (item.key) {
      case "dealType":
        return (
          <FormControl fullWidth size="small">
            <Select value={dealType} onChange={(e) => setDealType(e.target.value as DealType)}>
              <MenuItem value="IPO">IPO</MenuItem>
              <MenuItem value="FO">FO</MenuItem>
            </Select>
          </FormControl>
        );
      case "region":
        return (
          <FormControl fullWidth size="small">
            <Select value={region} onChange={(e) => setRegion(e.target.value as Region)}>
              <MenuItem value="US">US</MenuItem>
              <MenuItem value="Non-US">Non-US</MenuItem>
              <MenuItem value="APAC">APAC</MenuItem>
              <MenuItem value="EMEA">EMEA</MenuItem>
            </Select>
          </FormControl>
        );
      case "target":
        return (
          <FormControl fullWidth size="small">
            <Select value={target} onChange={(e) => setTarget(e.target.value as Target)}>
              <MenuItem value="T1D">T+1 Day Return</MenuItem>
              <MenuItem value="T1M">T+1 Month Return</MenuItem>
            </Select>
          </FormControl>
        );
      case "selected_bank_category":
        return (
          <FormControl fullWidth size="small">
            <Select
              value={formData[item.key] || ""}
              onChange={(e) => handleInputChange(item.key, e.target.value)}
            >
              {bankOptions.map((bank) => (
                <MenuItem key={bank} value={bank}>
                  {bank}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "sponsor_yn_category":
        return (
          <FormControl fullWidth size="small">
            <Select
              value={formData[item.key] || ""}
              onChange={(e) => handleInputChange(item.key, e.target.value)}
            >
              {sponsor_yn_categoryOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "sector_category":
        return (
          <FormControl fullWidth size="small">
            <Select
              value={formData[item.key] || ""}
              onChange={(e) => handleInputChange(item.key, e.target.value)}
            >
              {sectorOptions.map((sector) => (
                <MenuItem key={sector.value} value={sector.value}>
                  {sector.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      default:
        return (
          <TextField
            fullWidth
            size="small"
            type="number"
            inputProps={{ step: "any" }}
            value={formData[item.key] || ""}
            onChange={(e) => handleInputChange(item.key, e.target.value)}
            placeholder=""
          />
        );
    }
  };

  const formatTableData = () => {
    return [
      { label: "Deal Type", key: "dealType" },
      { label: "Region", key: "region" },
      { label: "Target", key: "target" },
      { label: labelMappings["selected_bank_category"] || "Selected Bank", key: "selected_bank_category" },
      { label: labelMappings["sponsor_yn_category"] || "Sponsor Y/N", key: "sponsor_yn_category" },
      { label: labelMappings["sector_category"] || "Sector", key: "sector_category" },
      ...fields.map((key) => ({ label: labelMappings[key] || key, key })),
    ];
  };

  return (
    <Box py={5} display="flex" flexDirection="column" alignItems="center">
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            <TableRow>
              {[0, 1].map((colIndex) => (
                <TableCell
                  key={colIndex}
                  sx={{
                    width: "50%",
                    padding: 1,
                    verticalAlign: "top",
                    borderRight: colIndex === 0 ? "1px solid #ccc" : undefined,
                    pl: colIndex === 1 ? 2 : 1,
                  }}
                >
                  <Table>
                    <TableBody>
                      {formatTableData()
                        .filter((_, idx) => idx % 2 === colIndex)
                        .map((item, index) => (
                          <TableRow
                            key={item.key}
                            sx={{
                              backgroundColor: index % 2 === 0 ? "#fff7f7" : "#ffffff",
                            }}
                          >
                            <TableCell sx={{ fontSize: "0.875rem", padding: "8px 8px" }}>
                              <Typography variant="body2">{item.label}</Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: "0.875rem", padding: "8px 8px" }}>
                              {renderInputField(item)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FormComponent;
