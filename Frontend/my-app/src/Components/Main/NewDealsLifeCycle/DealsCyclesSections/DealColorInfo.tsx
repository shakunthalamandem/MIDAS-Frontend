import React, { useState, ChangeEvent, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  Box,
  IconButton,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { motion } from "framer-motion";
import BlueSlider from "./BlueSlider";

interface DealColorData {
  id?: number | string;
  ticker: string;
  pricing_date: string; // YYYY-MM-DD
  deal_type: string;
  allocation_as_percentage_of_ioi?: number | null;
  average_ioi?: number | null;
  allocation_as_percentage_of_deal_size?: number | null;
  average_allocation?: number | null;
  times_covered?: string;
  deal_color_rating?: number;
}

interface DealColorInfoProps {
  data: DealColorData;
}

const DealColorInfo: React.FC<DealColorInfoProps> = ({ data }) => {
  const [formData, setFormData] = useState<DealColorData>(data);
  const [editable, setEditable] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    setFormData(data); // Ensure the form is updated when the selected deal changes
  }, [data]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name: keyof DealColorData, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const mapApiResponseToDealColorData = (
    apiData: any
  ): Partial<DealColorData> => {
    return {
      ticker: apiData.ticker,
      pricing_date: apiData.pricing_date,
      deal_type: apiData.deal_type,
      allocation_as_percentage_of_deal_size:
        apiData.allocation_as_percentage_of_deal_size,
      allocation_as_percentage_of_ioi: apiData.allocation_as_percentage_of_ioi,
      average_ioi: apiData.average_ioi,
      average_allocation: apiData.average_allocation,
      times_covered: apiData.times_covered,
      deal_color_rating: apiData.deal_color_rating,
    };
  };

  useEffect(() => {
    setFormData(data);
    if (data?.ticker && data?.pricing_date && data?.deal_type) {
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
        const mapped = mapApiResponseToDealColorData(result.data);

        // Merge into formData
        setFormData((prev) => ({
          ...prev,
          ...mapped,
        }));
      } else {
        console.error("Failed to fetch deal color info");
      }
    } catch (error) {
      console.error("Error fetching deal color info:", error);
    }
  };

  const handleSave = async () => {
    try {
      // Prepare payload with required fields
      const payload: Partial<DealColorData> = {
        id: data.id,
        ticker: data.ticker,
        pricing_date: data.pricing_date,
        deal_type: data.deal_type,
      };

      // Add only changed values
      Object.keys(formData).forEach((key) => {
        const k = key as keyof DealColorData;
        if (formData[k] !== data[k] && formData[k] !== undefined) {
          payload[k] = formData[k] as any;
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
      console.error(error);
    }
  };
const renderField = (
  label: string,
  name: keyof DealColorData,
  adornment?: string,
  canEdit: boolean = false
) => {
  const value = formData[name] ?? "";

  return (
    <>
      <Typography
        variant="body2"
        color="#002060" // Set label color
        gutterBottom
        fontWeight={500}
      >
        {label}
      </Typography>
      {editable && canEdit ? (
        <TextField
          name={name}
          value={value}
          onChange={handleChange}
          fullWidth
          size="small"
          variant="standard"
          InputProps={{
            disableUnderline: false,
            endAdornment:
              adornment && value !== "" && value !== null ? (
                <InputAdornment position="end">{adornment}</InputAdornment>
              ) : undefined,
            style: { color: "#002060" },
          }}
        />
      ) : (
        <Typography
          variant="body1"
          sx={{ color: "#B1062E", fontWeight: 500, py: 0.5 }} // Set value color
        >
          {value}
          {value !== "" && value !== null && adornment ? ` ${adornment}` : ""}
        </Typography>
      )}
    </>
  );
};


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card
        sx={{
          background: "linear-gradient(135deg, #e0ebff, #d4e2fc)",
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
              Deal Colour Info
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
            {/* Always readonly fields */}
            <Grid item xs={12} sm={6}>
              {renderField("Ticker", "ticker")}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField("Pricing Date", "pricing_date")}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField("Deal Type", "deal_type")}
            </Grid>
<Grid item xs={12} sm={6}>
  <Typography
    variant="body2"
    color="#002060"
    fontWeight={500}
    gutterBottom
  >
    Times Covered
  </Typography>
<RadioGroup
  row
  value={formData.times_covered || ""}
  onChange={handleChange}
  name="times_covered"
>
  <FormControlLabel
    value="1x-5x"
    control={
      <Radio
        disabled={!editable}
        sx={{
          color: '#B1062E',
          '&.Mui-checked': {
            color: '#B1062E',
          },
        }}
      />
    }
    sx={{
      color: formData.times_covered === '1x-5x' ? '#B1062E' : '#000000', // Apply color conditionally
    }}
    label="1x-5x"
  />
  <FormControlLabel
    value="5x-10x"
    control={
      <Radio
        disabled={!editable}
        sx={{
          color: '#B1062E',
          '&.Mui-checked': {
            color: '#B1062E',
          },
        }}
      />
    }
    sx={{
      color: formData.times_covered === '5x-10x' ? '#B1062E' : '#000000', // Apply color conditionally
    }}
    label="5x-10x"
  />
  <FormControlLabel
    value=">10x"
    control={
      <Radio
        disabled={!editable}
        sx={{
          color: '#B1062E',
          '&.Mui-checked': {
            color: '#B1062E',
          },
        }}
      />
    }
    sx={{
      color: formData.times_covered === '>10x' ? '#B1062E' : '#000000', // Apply color conditionally
    }}
    label=">10x"
  />
</RadioGroup>

</Grid>

            <Grid item xs={12} sm={6}>
              {renderField(
                "Last 10 deals Avg Allocation as % of Deal_Size",
                "average_allocation",
                "%"
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderField(
                "Last 10 deals Avg Allocation as % of IoI",
                "average_ioi",
                "%"
              )}
            </Grid>
            {/* Editable fields */}
            <Grid item xs={12} sm={6}>
              {renderField(
                "Allocation as % of Deal Size",
                "allocation_as_percentage_of_deal_size",
                "%",
                true
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              {renderField(
                "Allocation as % of IOI",
                "allocation_as_percentage_of_ioi",
                "%",
                true
              )}
            </Grid>

            <Grid item xs={12}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #e0eeecff, #e0eeecff)",
                  borderRadius: "20px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body1"
                    color="#002060"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Deal Color Rating
                  </Typography>
                  <BlueSlider
                    value={formData.deal_color_rating || 0}
                    onChange={(_, value) =>
                      handleSliderChange("deal_color_rating", value as number)
                    }
                    valueLabelDisplay="on"
                    step={1}
                    min={0}
                    max={100}
                    disabled={!editable}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DealColorInfo;
