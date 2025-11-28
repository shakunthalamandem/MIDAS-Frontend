// MDRDailyPortfolioFilters.tsx
import React from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";

export interface FilterState {
  tradeDate: string;
  fund: string[];   // multi-select
  asset: string[];  // multi-select
  region: string[]; // multi-select
}

interface Props {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onApply: () => void;
  onReset: () => void;
  loading: boolean;
}

const PRIMARY_COLOR = "#002060";

// replace these with real options from your API if needed
const fundOptions = ["Fund A", "Fund B", "Fund C"];
const assetOptions = ["Equity", "Fixed Income", "Derivatives"];
const regionOptions = ["APAC", "EMEA", "Americas"];

const MDRDailyPortfolioFilters: React.FC<Props> = ({
  filters,
  onChange,
  onApply,
  onReset,
  loading,
}) => {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ tradeDate: event.target.value });
  };

  // Generic handler for multi-select TextFields
  const handleMultiSelectChange =
    (field: "fund" | "asset" | "region") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value },
      } = event;

      const arrayValue =
        typeof value === "string" ? value.split(",") : (value as string[]);

      onChange({ [field]: arrayValue } as Partial<FilterState>);
    };

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        borderRadius: 2,
        backgroundColor: "#f0f3ff",
      }}
    >
      <Grid container spacing={2}>
        {/* Trade Date */}
        <Grid item xs={12} md={3}>
          <TextField
            label="Trade Date"
            type="date"
            value={filters.tradeDate}
            onChange={handleDateChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>

        {/* Fund (multi-select) */}
        <Grid item xs={12} md={3}>
          <TextField
            select
            label="Fund"
            value={filters.fund}
            onChange={handleMultiSelectChange("fund")}
            fullWidth
            size="small"
            SelectProps={{
              multiple: true,
              renderValue: (selected) =>
                (selected as string[]).length === 0
                  ? "All"
                  : (selected as string[]).join(", "),
            }}
          >
            {fundOptions.map((f) => (
              <MenuItem key={f} value={f}>
                {f}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Asset (multi-select) */}
        <Grid item xs={12} md={3}>
          <TextField
            select
            label="Asset"
            value={filters.asset}
            onChange={handleMultiSelectChange("asset")}
            fullWidth
            size="small"
            SelectProps={{
              multiple: true,
              renderValue: (selected) =>
                (selected as string[]).length === 0
                  ? "All"
                  : (selected as string[]).join(", "),
            }}
          >
            {assetOptions.map((a) => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Region (multi-select) */}
        <Grid item xs={12} md={3}>
          <TextField
            select
            label="Region"
            value={filters.region}
            onChange={handleMultiSelectChange("region")}
            fullWidth
            size="small"
            SelectProps={{
              multiple: true,
              renderValue: (selected) =>
                (selected as string[]).length === 0
                  ? "All"
                  : (selected as string[]).join(", "),
            }}
          >
            {regionOptions.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Buttons */}
        <Grid
          item
          xs={12}
          md={12}
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            mt: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={onReset}
            sx={{
              textTransform: "none",
              borderColor: PRIMARY_COLOR,
              color: PRIMARY_COLOR,
              "&:hover": {
                borderColor: PRIMARY_COLOR,
                backgroundColor: "rgba(0,32,96,0.05)",
              },
            }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={onApply}
            sx={{
              textTransform: "none",
              backgroundColor: PRIMARY_COLOR,
              "&:hover": {
                backgroundColor: "#001540",
              },
            }}
            disabled={!filters.tradeDate || loading}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: "#ffffff" }} />
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
