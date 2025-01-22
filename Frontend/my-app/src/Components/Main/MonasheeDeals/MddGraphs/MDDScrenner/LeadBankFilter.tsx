import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Checkbox,
  ListItemText,
  InputAdornment,
} from "@mui/material";
import axios from "axios";

interface LeadBankFilterProps {
  values: any;
  setFieldValue: (field: string, value: any) => void;
}

const LeadBankFilter: React.FC<LeadBankFilterProps> = ({ values, setFieldValue }) => {
  const [leadBankOptions, setLeadBankOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchKey, setSearchKey] = useState<string>("");
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchLeadBankOptions = async () => {
      setLoading(true);
      try {
        const response = await axios.get<{ selected_bank?: { options: string[] } }>(
          `${apiUrl}/api/mdd_screener_filters/`
        );

        const leadBankData = response.data?.selected_bank;

        if (leadBankData?.options) {
          setLeadBankOptions(leadBankData.options);
          setFilteredOptions(leadBankData.options);
        } else {
          console.warn("Lead Bank options not found in the API response.");
        }
      } catch (error) {
        console.error("Error fetching selected_bank options:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadBankOptions();
  }, []);

  const handleSearchChange = (searchValue: string) => {
    setSearchKey(searchValue);
    const filtered = leadBankOptions.filter((option) =>
      option.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredOptions(filtered);
  };

  // Handle selection of multiple items
  const handleSelectChange = (event: any) => {
    const { value } = event.target;
    setFieldValue("selected_bank", value);
  };

  if (loading) {
    return (
      <Grid item xs={12}>
        <Typography>Loading Lead Bank options...</Typography>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} sm={6} md={3}>
      <Box>
        <Typography
          sx={{
            fontSize: "0.75rem",
            fontWeight: 600,
            marginBottom: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          Lead Bank
        </Typography>

        {/* Search input */}
        {/* <TextField
          size="small"
          fullWidth
          placeholder="Search"
          value={searchKey}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{
            marginBottom: 2,
            backgroundColor: "#fff",
            borderRadius: "4px",
          }}
        /> */}

        {/* Select with Checkbox */}
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel id="lead-bank-label">Select Lead Banks</InputLabel>
          <Select
            labelId="lead-bank-label"
            id="lead-bank-select"
            multiple
            value={values["selected_bank"] || []}
            onChange={handleSelectChange}
            input={<OutlinedInput label="Select Lead Banks" />}
            renderValue={(selected) => selected.join(", ")}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 400,
                  maxWidth:250, // Limit height of the dropdown
                },
              },
            }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox checked={values["selected_bank"]?.includes(option) || false} />
                  <ListItemText  primary={option} />
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No options found</MenuItem>
            )}
          </Select>
        </FormControl>
      </Box>
    </Grid>
  );
};

export default LeadBankFilter;
