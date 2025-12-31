import React from "react";
import {
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Paper,
} from "@mui/material";

interface DealsFiltersProps {
  selectedOp: string;
  options: { value: string; label: string; helper: string }[];
  onChange: (value: string) => void;
}

const DealsFilters: React.FC<DealsFiltersProps> = ({
  selectedOp,
  options,
  onChange,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid rgba(0,32,96,0.12)",
        background:
          "linear-gradient(135deg, rgba(0,32,96,0.06), rgba(156,32,7,0.06))",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems="stretch"
        justifyContent="center"
      >
        <ToggleButtonGroup
          value={selectedOp}
          exclusive
          onChange={(_e, value) => value && onChange(value)}
          sx={{
            flexWrap: "wrap",
            "& .MuiToggleButton-root": {
              textTransform: "none",
              borderRadius: 2,
              borderColor: "rgba(0,32,96,0.15)",
              backgroundColor: "#fff",
              minWidth: 220,
              justifyContent: "flex-start",
              px: 2,
              py: 1.5,
            },
            "& .Mui-selected": {
              borderColor: "#9c2007",
              backgroundColor: "rgba(156,32,7,0.08)",
              color: "#002060",
            },
            "& .MuiToggleButtonGroup-grouped:not(:last-of-type)": {
              borderRight: "1px solid rgba(0,32,96,0.15)",
            },
          }}
        >
          {options.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              <Stack alignItems="flex-start" spacing={0.25}>
                <Typography fontWeight={700}>{option.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.helper}
                </Typography>
              </Stack>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
    </Paper>
  );
};

export default DealsFilters;
