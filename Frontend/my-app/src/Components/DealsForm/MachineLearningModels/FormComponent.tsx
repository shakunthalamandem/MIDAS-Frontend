import React from "react";
import {
  Box,
  Grid,
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
  InputLabel,
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
  const formatTableData = () => {
    const tableData = [
      { label: "Deal Type", value: dealType },
      { label: "Region", value: region },
      { label: "Target", value: target },
      ...fields.map((key) => ({
        label: key.replace(/_/g, " "),
        value: formData[key] ?? "",
      })),
    ];
    return tableData;
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <Box py={5} display="flex" flexDirection="column" alignItems="center">
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            <TableRow>
              {/* Left Column */}
              <TableCell sx={{ width: "50%", padding: 0 }}>
                <Table>
                  <TableBody>
                    {formatTableData().slice(0, 30).map((item, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff",
                        }}
                      >
                        <TableCell sx={{ fontSize: "0.875rem", padding: "8px 8px" }}>
                          <Typography variant="body2">{item.label}</Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", padding: "8px 8px" }}>
                          {item.label === "Deal Type" ? (
                            <FormControl fullWidth size="small">
                              <InputLabel>Deal Type</InputLabel>
                              <Select
                                value={dealType}
                                onChange={(e) => setDealType(e.target.value as DealType)}
                              >
                                <MenuItem value="IPO">IPO</MenuItem>
                                <MenuItem value="FO">FO</MenuItem>
                              </Select>
                            </FormControl>
                          ) : item.label === "Region" ? (
                            <FormControl fullWidth size="small">
                              <InputLabel>Region</InputLabel>
                              <Select
                                value={region}
                                onChange={(e) => setRegion(e.target.value as Region)}
                              >
                                <MenuItem value="US">US</MenuItem>
                                <MenuItem value="Non-US">Non-US</MenuItem>
                                <MenuItem value="APAC">APAC</MenuItem>
                                <MenuItem value="EMEA">EMEA</MenuItem>
                              </Select>
                            </FormControl>
                          ) : item.label === "Target" ? (
                            <FormControl fullWidth size="small">
                              <InputLabel>Target</InputLabel>
                              <Select
                                value={target}
                                onChange={(e) => setTarget(e.target.value as Target)}
                              >
                                <MenuItem value="T1D">T+1 Day Return</MenuItem>
                                <MenuItem value="T1M">T+1 Month Return</MenuItem>
                              </Select>
                            </FormControl>
                          ) : (
                            <input
                              value={formData[item.label] || ""}
                              onChange={(e) => handleInputChange(item.label, e.target.value)}
                              placeholder={item.label}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FormComponent;
