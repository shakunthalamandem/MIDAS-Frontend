import React from "react";
import {
  Grid,
  TextField,
  Typography,
  Box,
  Slider,
  styled,
  Select,
  MenuItem,
  FormControl,
  Radio,
  RadioGroup,
  FormLabel,
} from "@mui/material";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import { FormSectionProps } from "../../../types/NewDealFormData";
import type { SelectChangeEvent } from "@mui/material";

const BlueSlider = styled(Slider)({
  color: "#002060",
  height: 6,
  padding: "35px 0",
  "& .MuiSlider-thumb": {
    height: 16,
    width: 16,
    backgroundColor: "#002060",
    border: "2px solid white",
    transition: "0.3s ease-in-out",
    "&:hover": {
      boxShadow: "0 0 0 6px rgba(0, 32, 96, 0.2)",
    },
  },
  "& .MuiSlider-track": {
    border: "none",
    backgroundColor: "#002060",
  },
  "& .MuiSlider-rail": {
    opacity: 0.3,
    backgroundColor: "#002060",
  },
  "& .MuiSlider-valueLabel": {
    backgroundColor: "#c35305",
    color: "#fff",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "bold",
  },
});

const parsePercent = (value: string | number | undefined | null): number =>
  typeof value === "string"
    ? parseFloat(value.replace("%", "")) || 0
    : typeof value === "number"
      ? value
      : 0;

interface DealColorProps extends FormSectionProps {}

const DealColor: React.FC<DealColorProps> = ({ data, editable, onChange }) => {
  const [topAllocation, setTopAllocation] = React.useState(data.top_allocation || "top 10");

  const handleSliderChange = (name: string, value: number) => {
    onChange({ ...data, [name]: value });
  };

  const handleInputChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      onChange({ ...data, [name]: value });
    }
  };

  const handleTopNChange = (event: SelectChangeEvent<string>) => {
    setTopAllocation(event.target.value as string);
    onChange({ ...data, top_allocation: event.target.value });
  };

  const handleTimesCoveredChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, times_covered: event.target.value });
  };

  const longOnly = parsePercent(data.long_only_allocation_percentage);
  const hedgeFunds = parsePercent(data.hedge_allocation_percentage);
  const top10 = parsePercent(data.allocation_concentration_percentage);
  const institutional = parsePercent(data.institutional_allocation_percentage);
  const retail = 100 - institutional;

  return (
    <>
      <Typography
        variant="h6"
        gutterBottom
        align="center"
        color="#002060"
        fontWeight={600}
        mb={2}
      >
        <Box display="inline-flex" alignItems="center" gap={1}>
          <ColorLensIcon />
          Deal Color & Additional Allocations
        </Box>
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend" sx={{ color: "#002060", fontWeight: 600 }}>
              Times Covered:
            </FormLabel>
            <RadioGroup
              row
              name="times_covered"
              value={data.times_covered || ""}
              onChange={handleTimesCoveredChange}
            >
              {["1x-5x", "5x-10x", ">10x"].map((val) => (
                <Box display="flex" alignItems="center" mr={2} key={val}>
                  <Radio
                    value={val}
                    size="small"
                    disabled={!editable}
                    sx={{
                      color: "#002060",
                      "&.Mui-checked": { color: "#002060" },
                      "&.Mui-disabled": { color: "#002060" },
                    }}
                  />
                  <Typography variant="body2" sx={{ color: "#002060" }}>
                    {val}
                  </Typography>
                </Box>
              ))}
            </RadioGroup>
          </FormControl>

          <Grid container spacing={2}>
            {/* Slider with Input: Long Only */}
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom color="#002060">
                Long Only Allocation (%)
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginLeft: "8px" }}>
                <BlueSlider
                  value={longOnly}
                  onChange={(_, value) =>
                    handleSliderChange("long_only_allocation_percentage", value as number)
                  }
                  valueLabelDisplay="on"
                  step={1}
                  min={0}
                  max={100}
                  disabled={!editable}
                />
                <TextField
                  type="number"
                  value={longOnly}
                  onChange={handleInputChange("long_only_allocation_percentage")}
                  inputProps={{ min: 0, max: 100 }}
                  size="small"
                  sx={{ width: 80 }}
                  disabled={!editable}
                />
              </Box>
            </Grid>

            {/* Slider with Input: Hedge Funds */}
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom color="#002060">
                Hedge Funds Allocation (%)
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <BlueSlider
                  value={hedgeFunds}
                  onChange={(_, value) =>
                    handleSliderChange("hedge_allocation_percentage", value as number)
                  }
                  valueLabelDisplay="on"
                  step={1}
                  min={0}
                  max={100}
                  disabled={!editable}
                />
                <TextField
                  type="number"
                  value={hedgeFunds}
                  onChange={handleInputChange("hedge_allocation_percentage")}
                  inputProps={{ min: 0, max: 100 }}
                  size="small"
                  sx={{ width: 80 }}
                  disabled={!editable}
                />
              </Box>
            </Grid>

            {/* Slider with Input: Allocation Concentration */}
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography gutterBottom color="#002060" sx={{ mb: 0 }}>
                  Allocation Concentration (%)
                </Typography>
                <FormControl size="small" sx={{ minWidth: 70 }}>
                  <Select
                    value={topAllocation}
                    onChange={handleTopNChange}
                    size="small"
                    sx={{ fontSize: 13, height: 30 }}
                    disabled={!editable}
                  >
                    <MenuItem value="top 5">Top 5%</MenuItem>
                    <MenuItem value="top 10">Top 10%</MenuItem>
                    <MenuItem value="top 20">Top 20%</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginLeft: "8px" }}>
                <BlueSlider
                  value={top10}
                  onChange={(_, value) =>
                    handleSliderChange("allocation_concentration_percentage", value as number)
                  }
                  valueLabelDisplay="on"
                  step={1}
                  min={0}
                  max={100}
                  disabled={!editable}
                />
                <TextField
                  type="number"
                  value={top10}
                  onChange={handleInputChange("allocation_concentration_percentage")}
                  inputProps={{ min: 0, max: 100 }}
                  size="small"
                  sx={{ width: 80 }}
                  disabled={!editable}
                />
              </Box>
            </Grid>

            {/* Institutional vs Retail */}
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom color="#002060">
                Institutional vs Retail Allocation (%)
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <BlueSlider
                  value={institutional}
                  onChange={(_, value) =>
                    onChange({
                      ...data,
                      institutional_allocation_percentage: value,
                      retail_allocation_percentage: 100 - Number(value),
                    })
                  }
                  valueLabelDisplay="on"
                  step={1}
                  min={0}
                  max={100}
                  disabled={!editable}
                />
                <TextField
                  type="number"
                  value={institutional}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (!isNaN(value) && value >= 0 && value <= 100) {
                      onChange({
                        ...data,
                        institutional_allocation_percentage: value,
                        retail_allocation_percentage: 100 - value,
                      });
                    }
                  }}
                  inputProps={{ min: 0, max: 100 }}
                  size="small"
                  sx={{ width: 80 }}
                  disabled={!editable}
                />
              </Box>
              <Box display="flex" gap={3}>
                <Typography variant="body2" color="#002060">
                  Institutional: {institutional}%
                </Typography>
                <Typography variant="body2" color="#002060">
                  Retail: {retail}%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Side: Deal Colour TextArea */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Deal Color"
            name="deal_color"
            value={data.deal_color || ""}
            onChange={(e) => onChange({ ...data, deal_color: e.target.value })}
            fullWidth
            multiline
            minRows={10}
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
            InputLabelProps={{ style: { color: "#002060" } }}
            InputProps={{
              sx: {
                "&.Mui-disabled": {
                  WebkitTextFillColor: "#b1062e",
                },
                "& textarea.Mui-disabled": {
                  WebkitTextFillColor: "#b1062e",
                  color: "#b1062e",
                },
              },
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default DealColor;
