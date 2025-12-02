import React from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Checkbox,
  ListItemText,
  Button,
  CircularProgress,
} from "@mui/material";

export interface RegionFilterState {
  fund: string[];
  asset: string[];
}

export interface RegionFilterOptions {
  fund: string[];
  assetTypes: string[];
}

interface Props {
  filters: RegionFilterState;
  options: RegionFilterOptions;
  loading: boolean;
  onChange: (updated: Partial<RegionFilterState>) => void;
  onApply: () => void;
  onReset: () => void;
}

const PRIMARY_COLOR = "#002060";

const MDRRegionPnLFilters: React.FC<Props> = ({
  filters,
  options,
  loading,
  onChange,
  onApply,
  onReset,
}) => {
  const handleMultiSelectChange =
    (field: "fund" | "asset") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const arrayValue = typeof value === "string" ? value.split(",") : value;
      onChange({ [field]: arrayValue } as Partial<RegionFilterState>);
    };

  const renderSelected = (selected: unknown) => {
    const arr = selected as string[];
    if (!arr || arr.length === 0) return "All";
    return arr.join(", ");
  };

  return (
    <Box
      maxWidth="xl"
      sx={{
        mb: 2,
        p: 2,
        borderRadius: 2,
        backgroundColor: "#f0f3ff",
        fontSize: "12px",
      }}
    >
      <Grid
        container
        spacing={2}
        alignItems="center"
        sx={{ fontSize: "12px" }}
      >
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Fund"
            value={filters.fund}
            onChange={handleMultiSelectChange("fund")}
            fullWidth
            size="small"
            SelectProps={{
              multiple: true,
              renderValue: renderSelected,
            }}
            sx={{ fontSize: "12px" }}
          >
            {options.fund.map((f) => (
              <MenuItem key={f} value={f}>
                <Checkbox size="small" checked={filters.fund.includes(f)} />
                <ListItemText primary={f} />
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Asset"
            value={filters.asset}
            onChange={handleMultiSelectChange("asset")}
            fullWidth
            size="small"
            SelectProps={{
              multiple: true,
              renderValue: renderSelected,
            }}
            sx={{ fontSize: "12px" }}
          >
            {options.assetTypes.map((a) => (
              <MenuItem key={a} value={a}>
                <Checkbox size="small" checked={filters.asset.includes(a)} />
                <ListItemText primary={a} />
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
          sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
        >
          <Button
            variant="outlined"
            onClick={onReset}
            sx={{
              textTransform: "none",
              borderColor: PRIMARY_COLOR,
              color: PRIMARY_COLOR,
              fontSize: "12px",
              minWidth: "70px",
            }}
          >
            Reset
          </Button>

          <Button
            variant="contained"
            onClick={onApply}
            disabled={loading}
            sx={{
              textTransform: "none",
              backgroundColor: PRIMARY_COLOR,
              "&:hover": { backgroundColor: "#001540" },
              fontSize: "12px",
              minWidth: "70px",
            }}
          >
            {loading ? (
              <CircularProgress size={16} sx={{ color: "#ffffff" }} />
            ) : (
              "Apply"
            )}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MDRRegionPnLFilters;
