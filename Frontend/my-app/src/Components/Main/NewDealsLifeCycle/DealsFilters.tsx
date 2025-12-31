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
  options: { value: string; label: string; helper: string; icon?: React.ReactNode }[];
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
        backgroundColor: "#f7f9ff",
        boxShadow: "none",
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
            borderRadius: 2.5,
            border: "1px solid rgba(0,32,96,0.15)",
            backgroundColor: "#ffffff",
            minWidth: 240,
            justifyContent: "flex-start",
            px: 2.4,
            py: 1.8,
            gap: 10,
            transition: "all 0.25s ease",
            boxShadow: "0 4px 12px rgba(0,32,96,0.08)",
          },
          "& .Mui-selected": {
            borderColor: "rgba(0,32,96,0.28)",
            background: "linear-gradient(120deg, rgba(0,32,96,0.12), rgba(21,101,192,0.14))",
            color: "#002060",
            boxShadow: "0 10px 26px rgba(0,32,96,0.18)",
          },
          "& .MuiToggleButtonGroup-grouped:not(:last-of-type)": {
            border: "1px solid rgba(0,32,96,0.12)",
            marginRight: 1.2,
          },
          "& .MuiToggleButton-root:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 10px 22px rgba(0,32,96,0.16)",
          },
        }}
      >
        {options.map((option) => (
          <ToggleButton key={option.value} value={option.value}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                {option.icon}
                <Stack alignItems="flex-start" spacing={0.25}>
                <Typography fontWeight={700}>{option.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.helper}
                </Typography>
                </Stack>
              </Stack>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
    </Paper>
  );
};

export default DealsFilters;
