import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import axios from "axios";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface LeadBankFilterProps {
  values: any;
  setFieldValue: (field: string, value: any) => void;
}

const LeadBankFilter: React.FC<LeadBankFilterProps> = ({ values, setFieldValue }) => {
  const [leadBankOptions, setLeadBankOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchKey, setSearchKey] = useState<string>("");
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchLeadBankOptions = async () => {
      setLoading(true);
      try {
        const response = await axios.get<{ lead_bank?: { options: string[] } }>(
          "http://192.168.1.59:9000/api/mdd_screener_filters/"
        );

        const leadBankData = response.data?.lead_bank;

        if (leadBankData?.options) {
          setLeadBankOptions(leadBankData.options);
          setFilteredOptions(leadBankData.options);
        } else {
          console.warn("Lead Bank options not found in the API response.");
        }
      } catch (error) {
        console.error("Error fetching lead_bank options:", error);
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

            <TextField
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
            />

            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={values["lead_bank"]?.includes(option) || false}
                      onChange={() => {
                        const newValues = values["lead_bank"]?.includes(option)
                          ? values["lead_bank"].filter((item: string) => item !== option) // Deselect
                          : [...(values["lead_bank"] || []), option]; // Select
                        setFieldValue("lead_bank", newValues || []);
                      }}
                      sx={{
                        "&.Mui-checked": {
                          color: "#FF8C00", // Checkbox checked color
                        },
                        paddingLeft: 0, // Align checkbox better
                      }}
                    />
                  }
                  label={option}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    fontSize: "0.875rem",
                    marginBottom: 1,
                  }}
                />
              ))
            ) : (
              <Typography sx={{ color: "#999", fontSize: "0.875rem" }}>
                No options found
              </Typography>
            )}

      </Box>
    </Grid>
  );
};

export default LeadBankFilter;
