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

const bankOptions = ["Goldman Sachs", "Morgan Stanley", "JPMorgan", "Citigroup", "Barclays"];
const sponsorOptions = ["Yes", "No"];

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
    const updatedValue = isNaN(Number(value)) ? value : String(Number(value));
    setFormData({ ...formData, [key]: updatedValue });
  };

  const renderInputField = (item: { key: string; label: string }) => {
    if (item.key === "dealType") {
      return (
        <FormControl fullWidth size="small">
          <Select value={dealType} onChange={(e) => setDealType(e.target.value as DealType)}>
            <MenuItem value="IPO">IPO</MenuItem>
            <MenuItem value="FO">FO</MenuItem>
          </Select>
        </FormControl>
      );
    }

    if (item.key === "region") {
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
    }

    if (item.key === "target") {
      return (
        <FormControl fullWidth size="small">
          <Select value={target} onChange={(e) => setTarget(e.target.value as Target)}>
            <MenuItem value="T1D">T+1 Day Return</MenuItem>
            <MenuItem value="T1M">T+1 Month Return</MenuItem>
          </Select>
        </FormControl>
      );
    }

    if (item.key === "selected_bank") {
      return (
        <FormControl fullWidth size="small">
          <Select
            value={formData["selected_bank"] || ""}
            onChange={(e) => handleInputChange("selected_bank", e.target.value)}
          >
            {bankOptions.map((bank) => (
              <MenuItem key={bank} value={bank}>
                {bank}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    if (item.key === "sponsor") {
      return (
        <FormControl fullWidth size="small">
          <Select
            value={formData["sponsor"] || ""}
            onChange={(e) => handleInputChange("sponsor", e.target.value)}
          >
            {sponsorOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    if (item.key === "sector") {
      return (
        <FormControl fullWidth size="small">
          <Select
            value={formData["sector"] || ""}
            onChange={(e) => handleInputChange("sector", e.target.value)}
          >
            {sectorOptions.map((sector) => (
              <MenuItem key={sector.value} value={sector.value}>
                {sector.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    return (
      <TextField
        fullWidth
        size="small"
        type="number"
        value={formData[item.key] || ""}
        onChange={(e) => handleInputChange(item.key, e.target.value)}
        placeholder={item.label}
      />
    );
  };

  const formatTableData = () => {
    return [
      { label: "Deal Type", key: "dealType" },
      { label: "Region", key: "region" },
      { label: "Target", key: "target" },
      { label: "Selected Bank", key: "selected_bank" },
      { label: "Sponsor", key: "sponsor" },
      { label: "Sector", key: "sector" },
      ...fields.map((key) => ({ label: key, key })),
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
                              backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff",
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
