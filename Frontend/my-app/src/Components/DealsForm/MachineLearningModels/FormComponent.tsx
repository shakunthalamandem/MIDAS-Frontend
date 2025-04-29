// FormComponent.tsx
import React from "react";
import { Box, Grid, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";

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
  sponsorOptions: string[];
  bankOptions: string[];
  sectorOptions: { value: string; label: string }[];
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
  sponsorOptions,
  bankOptions,
  sectorOptions,
}) => {
  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Box py={5} display="flex" flexDirection="column" alignItems="center">
      <Grid container spacing={2}>
        {/* Deal Type */}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Deal Type</InputLabel>
            <Select value={dealType} onChange={(e) => setDealType(e.target.value as DealType)} label="Deal Type">
              <MenuItem value="IPO">IPO</MenuItem>
              <MenuItem value="FO">FO</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Region */}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Region</InputLabel>
            <Select value={region} onChange={(e) => setRegion(e.target.value as Region)} label="Region">
              <MenuItem value="US">US</MenuItem>
              <MenuItem value="Non-US">Non-US</MenuItem>
              <MenuItem value="APAC">APAC</MenuItem>
              <MenuItem value="EMEA">EMEA</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Target */}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Target</InputLabel>
            <Select value={target} onChange={(e) => setTarget(e.target.value as Target)} label="Target">
              <MenuItem value="T1M">T+1 Month Return</MenuItem>
              <MenuItem value="T1D">T+1 Day Return</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Form Inputs (Dynamic) */}
      <Grid container spacing={2} mb={4}>
        {fields.map((key) => {
          const label = key.replace(/_/g, " ");
          let options: string[] | { value: string; label: string }[] | null = null;

          if (key === "sponsor_yn_category") options = sponsorOptions;
          else if (key === "selected_bank_category") options = bankOptions;
          else if (key === "sector_category") options = sectorOptions;

          return (
            <Grid item xs={12} sm={6} md={3} key={key}>
              <FormControl fullWidth>
                {options && <InputLabel>{label}</InputLabel>}
                {options ? (
                  <Select
                    value={formData[key] ?? ""}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    label={label}
                  >
                    {options.map((option) => (
                      <MenuItem
                        value={typeof option === "string" ? option : option.value}
                        key={typeof option === "string" ? option : option.value}
                      >
                        {typeof option === "string" ? option : option.label}
                      </MenuItem>
                    ))}
                  </Select>
                ) : (
                  <TextField
                    label={label}
                    value={formData[key] ?? ""}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    variant="outlined"
                    fullWidth
                  />
                )}
              </FormControl>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default FormComponent;
