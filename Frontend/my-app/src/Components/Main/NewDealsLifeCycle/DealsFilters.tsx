import React from "react";
import { Stack, Checkbox, FormControlLabel, Button } from "@mui/material";

interface DealsFiltersProps {
  selectedOp: string;
  onChange: (value: string) => void;
  onTogglePipeline?: () => void;
  showPipeline?: boolean;
}

const DealsFilters: React.FC<DealsFiltersProps> = ({
  selectedOp,
  onChange,
  onTogglePipeline,
  showPipeline,
}) => {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={3}
      justifyContent="center"
      alignItems={{ xs: "flex-start", sm: "center" }}
      sx={{ mb: 2, flexWrap: "wrap", gap: 2 }}
    >
      <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
        {["Upcoming Deals", "Issued September to Date"].map((value) => (
          <FormControlLabel
            key={value}
            control={
              <Checkbox
                checked={selectedOp === value}
                onChange={() => onChange(value)}
                sx={{
                  color: "#9c2007",
                  "&.Mui-checked": {
                    color: "#9c2007",
                  },
                }}
              />
            }
            label={value.replace(/^\w/, (c) => c.toUpperCase())}
          />
        ))}
      </Stack>

      {onTogglePipeline && (
        <Button
          variant={showPipeline ? "contained" : "outlined"}
          onClick={onTogglePipeline}
          sx={{
            borderColor: "#9c2007",
            color: showPipeline ? "#fff" : "#9c2007",
            backgroundColor: showPipeline ? "#9c2007" : "transparent",
            "&:hover": {
              borderColor: "#7d1b08",
              backgroundColor: showPipeline ? "#7d1b08" : "rgba(156,32,7,0.08)",
            },
            fontWeight: 700,
            textTransform: "none",
            minWidth: 220,
          }}
        >
          {showPipeline ? "Back to New Deals" : "View Expected Pipeline Deals"}
        </Button>
      )}
    </Stack>
  );
};

export default DealsFilters;
