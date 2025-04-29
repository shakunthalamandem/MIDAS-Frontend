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
  InputLabel,
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

  const formatTableData = () => {
    return [
      { label: "Deal Type", key: "dealType", value: dealType },
      { label: "Region", key: "region", value: region },
      { label: "Target", key: "target", value: target },
      ...fields.map((key) => ({
        label: isNaN(Number(key)) ? key : key,
        key,
        value: formData[key] ?? "0",
      })),
    ];
  };

  return (
    <Box py={5} display="flex" flexDirection="column" alignItems="center">
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell sx={{ width: "50%", padding: 0 }}>
                <Table>
                  <TableBody>
                    {formatTableData().slice(0, Math.ceil(formatTableData().length / 2)).map((item, index) => (
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
                                label="Deal Type"
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
                                label="Region"
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
                                label="Target"
                              >
                                <MenuItem value="T1D">T+1 Day Return</MenuItem>
                                <MenuItem value="T1M">T+1 Month Return</MenuItem>
                              </Select>
                            </FormControl>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              value={formData[item.key] || ""}
                              onChange={(e) => handleInputChange(item.key, e.target.value)}
                              placeholder={item.label}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableCell>
              <TableCell sx={{ width: "50%", padding: 0 }}>
                <Table>
                  <TableBody>
                    {formatTableData().slice(Math.ceil(formatTableData().length / 2)).map((item, index) => (
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
                                label="Deal Type"
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
                                label="Region"
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
                                label="Target"
                              >
                                <MenuItem value="T1D">T+1 Day Return</MenuItem>
                                <MenuItem value="T1M">T+1 Month Return</MenuItem>
                              </Select>
                            </FormControl>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              value={formData[item.key] || ""}
                              onChange={(e) => handleInputChange(item.key, e.target.value)}
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
