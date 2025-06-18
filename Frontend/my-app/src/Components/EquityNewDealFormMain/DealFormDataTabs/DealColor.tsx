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
} from "@mui/material";
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { FormSectionProps } from "../../../types/NewDealFormData";
import type { SelectChangeEvent } from "@mui/material";

const BlueSlider = styled(Slider)({
  color: "#002060",
  height: 6,
  padding: "35px 0",
  '& .MuiSlider-thumb': {
    height: 16,
    width: 16,
    backgroundColor: "#002060",
    border: "2px solid white",
    transition: "0.3s ease-in-out",
    '&:hover': {
      boxShadow: "0 0 0 6px rgba(0, 32, 96, 0.2)",
    },
  },
  '& .MuiSlider-track': {
    border: "none",
    backgroundColor: "#002060",
  },
  '& .MuiSlider-rail': {
    opacity: 0.3,
    backgroundColor: "#002060",
  },
  '& .MuiSlider-valueLabel': {
    backgroundColor: '#c35305',
    color: '#fff',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

const parsePercent = (value: string | number | undefined): number =>
  typeof value === "string"
    ? parseFloat(value.replace("%", "")) || 0
    : typeof value === "number"
      ? value
      : 0;

interface DealColorProps extends FormSectionProps {
  topAllocation: string;
  setTopAllocation: (value: string) => void;
}

const DealColor: React.FC<DealColorProps> = ({
  data,
  editable,
  onChange,
  topAllocation,
  setTopAllocation,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  const handleSliderChange = (name: string, value: number) => {
    onChange({ ...data, [name]: value });
  };

  const handleTopNChange = (event: SelectChangeEvent<string>) => {
    setTopAllocation(event.target.value as string);
  };

  const longOnly = parsePercent(data.long_only_allocation_percent);
  const hedgeFunds = parsePercent(data.hedge_funds_allocation_percent);
  const top10 = parsePercent(data.top_10_allocation_concentration_percent);
  const institutional = parsePercent(data.institutional_allocation_percent);
  const retail = 100 - institutional;

  return (
    <>
      <Typography variant="h6" gutterBottom align="center" color="#002060" fontWeight={600} mb={2}>
        <Box display="inline-flex" alignItems="center" gap={1}>
          <ColorLensIcon />
          Deal Color & Additional Allocations
        </Box>
      </Typography>

      <Grid container spacing={2}>
        {/* LEFT: Sliders */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom color="#002060">
                Long Only Allocation (%)
              </Typography>
              <Box sx={{ width: 200, textAlign: "left" }}>
                <BlueSlider
                  value={longOnly}
                  onChange={(_, value) =>
                    handleSliderChange("long_only_allocation_percent", value as number)
                  }
                  valueLabelDisplay="on"
                  step={1}
                  min={0}
                  max={100}
                  disabled={!editable}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography gutterBottom color="#002060">
                Hedge Funds Allocation (%)
              </Typography>
              <Box sx={{ width: 200, textAlign: "left" }}>
                <BlueSlider
                  value={hedgeFunds}
                  onChange={(_, value) =>
                    handleSliderChange("hedge_funds_allocation_percent", value as number)
                  }
                  valueLabelDisplay="on"
                  step={1}
                  min={0}
                  max={100}
                  disabled={!editable}
                />
              </Box>
            </Grid>

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
              <Box sx={{ width: 200, textAlign: "left" }}>
                <BlueSlider
                  value={top10}
                  onChange={(_, value) =>
                    handleSliderChange("top_10_allocation_concentration_percent", value as number)
                  }
                  valueLabelDisplay="on"
                  step={1}
                  min={0}
                  max={100}
                  disabled={!editable}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography gutterBottom color="#002060">
                Institutional vs Retail Allocation (%)
              </Typography>
              <Box sx={{ width: 200, textAlign: "left" }}>
                <BlueSlider
                  value={institutional}
                  onChange={(_, value) =>
                    onChange({
                      ...data,
                      institutional_allocation_percent: value,
                      retail_allocation_percent: 100 - Number(value),
                    })
                  }
                  valueLabelDisplay="on"
                  step={1}
                  min={0}
                  max={100}
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

        {/* RIGHT: Deal Color Text Area */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Deal Colour"
            name="deal_colour"
            value={data.deal_colour || ""}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={10}
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
            InputLabelProps={{ style: { color: "#002060" } }}
            InputProps={{ style: { color: "#002060" } }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default DealColor;