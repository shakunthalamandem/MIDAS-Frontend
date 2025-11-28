// MDRDailyPortfolioFilters.tsx
import React from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Checkbox,
  ListItemText,
} from "@mui/material";

export interface FilterState {
  tradeDate: string;
  fund: string[];
  asset: string[];
  region: string[];
}

export interface FilterOptions {
  fund: string[];
  assetTypes: string[];
  regions: string[];
}

interface Props {
  filters: FilterState;
  filterOptions: FilterOptions;
  onChange: (updated: Partial<FilterState>) => void;
  onApply: () => void;
  onReset: () => void;
  loading: boolean;
}

const PRIMARY_COLOR = "#002060";

const MDRDailyPortfolioFilters: React.FC<Props> = ({
  filters,
  filterOptions,
  onChange,
  onApply,
  onReset,
  loading,
}) => {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ tradeDate: event.target.value });
  };

  const handleMultiSelectChange =
    (field: "fund" | "asset" | "region") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const arrayValue = typeof value === "string" ? value.split(",") : value;
      onChange({ [field]: arrayValue } as Partial<FilterState>);
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
        {/* TRADE DATE */}
        <Grid item xs={12} md={2.4}>
          <TextField
            label="Trade Date"
            type="date"
            value={filters.tradeDate}
            onChange={handleDateChange}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ fontSize: "12px" }}
          />
        </Grid>

        {/* FUND */}
        <Grid item xs={12} md={2.4}>
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
            {filterOptions.fund.map((f) => (
              <MenuItem key={f} value={f}>
                <Checkbox size="small" checked={filters.fund.includes(f)} />
                <ListItemText primary={f} />
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* ASSET TYPE */}
        <Grid item xs={12} md={2.4}>
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
            {filterOptions.assetTypes.map((a) => (
              <MenuItem key={a} value={a}>
                <Checkbox size="small" checked={filters.asset.includes(a)} />
                <ListItemText primary={a} />
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* REGION */}
        <Grid item xs={12} md={2.4}>
          <TextField
            select
            label="Region"
            value={filters.region}
            onChange={handleMultiSelectChange("region")}
            fullWidth
            size="small"
            SelectProps={{
              multiple: true,
              renderValue: renderSelected,
            }}
            sx={{ fontSize: "12px" }}
          >
            {filterOptions.regions.map((r) => (
              <MenuItem key={r} value={r}>
                <Checkbox size="small" checked={filters.region.includes(r)} />
                <ListItemText primary={r} />
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* APPLY + RESET (same row) */}
        <Grid
          item
          xs={12}
          md={2.4}
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
            disabled={!filters.tradeDate || loading}
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

export default MDRDailyPortfolioFilters;
