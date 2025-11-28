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
  fund: string;
  asset: string;
  region: string;
}

interface Props {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onApply: () => void;
  onReset: () => void;
  loading: boolean;
}

const PRIMARY_COLOR = "#002060";

const fundOptions = ["Fund A", "Fund B", "Fund C"]; // replace with real data
const assetOptions = ["Equity", "Fixed Income", "Derivatives"];
const regionOptions = ["APAC", "EMEA", "Americas"];

const MDRDailyPortfolioFilters: React.FC<Props> = ({
  filters,
  onChange,
  onApply,
  onReset,
  loading,
}) => {
  const handleFieldChange =
    (field: keyof FilterState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ [field]: event.target.value });
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
        <Grid item xs={12} md={2}>
          <TextField
            label="Trade Date"
            type="date"
            value={filters.tradeDate}
            onChange={handleFieldChange("tradeDate")}
            fullWidth
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            select
            label="Fund"
            value={filters.fund}
            onChange={handleFieldChange("fund")}
            fullWidth
            size="small"
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {fundOptions.map((f) => (
              <MenuItem key={f} value={f}>
                {f}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            select
            label="Asset"
            value={filters.asset}
            onChange={handleFieldChange("asset")}
            fullWidth
            size="small"
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {assetOptions.map((a) => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            select
            label="Region"
            value={filters.region}
            onChange={handleFieldChange("region")}
            fullWidth
            size="small"
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {regionOptions.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid
          item
          xs={12}
          md={2}
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
