import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  IconButton,
  Box,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { motion } from "framer-motion";

// --- Types ---
interface DealIoiValuesTableData {
  id?: number | string;
  ticker: string;
  pricing_date: string;
  deal_type: string;
  ioi_as_percentage_of_deal_size_status?: number | string;
  potential_am_quantity?: number | string;
  [key: string]: any;
}

interface DealIoiValuesTableProps {
  data: DealIoiValuesTableData;
}

// --- Component ---
const DealIoiValuesTable: React.FC<DealIoiValuesTableProps> = ({ data }) => {
  const [formData, setFormData] = useState<DealIoiValuesTableData>(data);
  const [editable, setEditable] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    setFormData(data);
    if (data.ticker && data.pricing_date && data.deal_type) {
      fetchDealColorInfo();
    }
  }, [data]);

  const fetchDealColorInfo = async () => {
    try {
      const payload = {
        ticker: data.ticker,
        pricing_date: data.pricing_date,
        deal_type: data.deal_type,
      };

      const response = await fetch(`${apiUrl}/api/unified_deal_ratings/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        setFormData((prev) => ({
          ...prev,
          ...result.data,
        }));
      } else {
        console.error("Failed to fetch deal info");
      }
    } catch (error) {
      console.error("Error fetching deal info:", error);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const payload: Partial<DealIoiValuesTableData> = {
        id: data.id,
        ticker: data.ticker,
        pricing_date: data.pricing_date,
        deal_type: data.deal_type,
      };

      Object.keys(formData).forEach((key) => {
        if (
          formData[key] !== data[key] &&
          formData[key] !== undefined &&
          key !== "id" &&
          key !== "ticker" &&
          key !== "pricing_date" &&
          key !== "deal_type"
        ) {
          payload[key] = formData[key];
        }
      });

      const response = await fetch(`${apiUrl}/api/unified_deal_ratings/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Saved successfully!");
        setEditable(false);
      } else {
        alert("Failed to save data");
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const renderField = (
    label: string,
    name: keyof DealIoiValuesTableData,
    adornment?: string
  ) => {
    const rawValue = formData[name];
    const isValueAvailable =
      rawValue !== null && rawValue !== undefined && rawValue !== "";
    const displayValue = isValueAvailable ? rawValue : "Not Available";

    return (
      <>
        <Typography
          variant="body2"
          color="#002060"
          fontWeight={500}
          gutterBottom
        >
          {label}
        </Typography>
        {editable ? (
          <TextField
  name={String(name)}
  value={isValueAvailable ? rawValue : ""}
  onChange={handleChange}
  fullWidth
  size="small"
  variant="standard"
  InputProps={{
    endAdornment: adornment ? (
      <InputAdornment position="end">{adornment}</InputAdornment>
    ) : undefined,
  }}
/>

        ) : (
          <Typography
            variant="body1"
            sx={{
              color: isValueAvailable ? "#B1062E" : "#999",
              fontWeight: 500,
              py: 0.5,
            }}
          >
            {displayValue}
            {isValueAvailable && adornment ? ` ${adornment}` : ""}
          </Typography>
        )}
      </>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card
        sx={{
          background: "linear-gradient(135deg, #e0eeecff, #e0eeecff)",
          borderRadius: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          p: 2,
        }}
      >
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" color="#002060" fontWeight="bold">
              IOI Values
            </Typography>
            <IconButton
              onClick={() => (editable ? handleSave() : setEditable(true))}
            >
              {editable ? (
                <SaveIcon sx={{ color: "#002060" }} />
              ) : (
                <EditIcon sx={{ color: "#002060" }} />
              )}
            </IconButton>
          </Box>

          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} sm={6}>
              {renderField(
                "IOI as % of Deal Size",
                "ioi_as_percentage_of_deal_size_status",
                "% of deal size"
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography
                variant="body2"
                color="#002060"
                fontWeight={500}
                gutterBottom
              >
                Potential AM Quantity
              </Typography>
              <RadioGroup
                row
                name="potential_am_quantity"
                value={formData.potential_am_quantity?.toString() || "0"}
                onChange={handleChange}
              >
                {[
                  { label: "None", value: "0" },
                  { label: "0.5 * allocations", value: "0.5" },
                  { label: "1 * allocations", value: "1" },
                  { label: "2 * allocations", value: "2" },
                  { label: "5 * allocations", value: "5" },
                ].map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={
                      <Radio
                        disabled={!editable}
                        sx={{
                          color: "#B1062E",
                          "&.Mui-checked": {
                            color: "#B1062E",
                          },
                        }}
                      />
                    }
                    label={option.label}
                  />
                ))}
              </RadioGroup>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DealIoiValuesTable;
