// MDRFundRegionWiseFilters.tsx
import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";

export interface FundRegionFilterState {
  startDate: string;
  endDate: string;
  asset: string[];
}

export interface FundRegionFilterOptions {
  assetTypes: string[];
}

interface Props {
  filters: FundRegionFilterState;
  filterOptions: FundRegionFilterOptions;
  loading: boolean;
  onChange: (update: Partial<FundRegionFilterState>) => void;
  onApply: () => void;
  onReset: () => void;
}

const MDRFundRegionWiseFilters: React.FC<Props> = ({
  filters,
  filterOptions,
  loading,
  onChange,
  onApply,
  onReset,
}) => {
  const handleDate =
    (field: "startDate" | "endDate") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ [field]: e.target.value });
    };

  const handleAsset = (e: SelectChangeEvent<string[]>) => {
    const v = e.target.value;
    const arr = typeof v === "string" ? v.split(",") : v;
    onChange({ asset: arr });
  };

  const isSelected = (value: string) => filters.asset.indexOf(value) > -1;

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 3,
        borderRadius: 3,
        backgroundColor: "#f0f3ff",
      }}
    >
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Filters
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={handleDate("startDate")}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={handleDate("endDate")}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Asset Type</InputLabel>
              <Select
                multiple
                value={filters.asset}
                onChange={handleAsset}
                input={<OutlinedInput label="Asset Type" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((s) => (
                      <Chip key={s} label={s} size="small" />
                    ))}
                  </Box>
                )}
              >
                {filterOptions.assetTypes.map((a) => (
                  <MenuItem key={a} value={a}>
                    <Checkbox
                      size="small"
                      checked={isSelected(a)}
                      sx={{ mr: 1 }}
                    />
                    <ListItemText primary={a} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2} sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              disabled={loading}
              fullWidth
              onClick={onApply}
              sx={{
                backgroundColor: "#002060",
                "&:hover": { backgroundColor: "#001648" },
              }}
            >
              {loading ? "Loading..." : "Apply"}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              disabled={loading}
              onClick={onReset}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MDRFundRegionWiseFilters;
