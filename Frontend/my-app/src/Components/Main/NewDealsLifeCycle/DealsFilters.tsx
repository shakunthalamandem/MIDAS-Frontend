import React from "react";
import { Box, Stack, ToggleButton, ToggleButtonGroup, Typography, Paper } from "@mui/material";

interface DealsFiltersProps {
  selectedOp: string;
  options: { value: string; label: string; helper: string; icon?: React.ReactNode }[];
  onChange: (value: string) => void;
  rightContent?: React.ReactNode;
}

const DealsFilters: React.FC<DealsFiltersProps> = ({ selectedOp, options, onChange, rightContent }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1, md: 1.5 },
        borderRadius: 3,
        // border: "1px solid rgba(0,32,96,0.08)",
        backgroundColor: "#f4f7fb",
        // boxShadow: "0 6px 16px rgba(0,32,96,0.06)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="center"
        sx={{ width: "100%" }}
      >
        <ToggleButtonGroup
          value={selectedOp}
          exclusive
        onChange={(_e, value) => value && onChange(value)}
        sx={{
          flexWrap: "wrap",
          columnGap: { xs: 1, md: 1.5 },
          rowGap: { xs: 1, md: 1.25 },
          "& .MuiToggleButton-root": {
            textTransform: "none",
            borderRadius: 9999,
            border: "1px solid #002060",
            backgroundColor: "#e9eef6",
            minWidth: 200,
            justifyContent: "flex-start",
            px: 1.8,
            py: 0.75,
            gap: 10,
            transition: "all 0.2s ease",
            boxShadow: "0 3px 10px rgba(0,32,96,0.08)",
            color: "#002060",
          },
          "& .Mui-selected": {
            borderColor: "#00133a",
            background: "linear-gradient(135deg, #0a2b7a 0%, #002060 45%, #001745 100%)",
            color: "#ffffff",
            boxShadow: "0 12px 26px rgba(0,32,96,0.32)",
          },
          "& .Mui-selected .deal-label": {
            color: "#ffffff",
          },
          "& .Mui-selected .deal-helper": {
            color: "rgba(255,255,255,0.82)",
          },
          "& .Mui-selected .deal-icon": {
            color: "#ffffff",
          },
          "& .MuiToggleButton-root:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 10px 20px rgba(0,32,96,0.18)",
            backgroundColor: "#dfe7f5",
          },
        }}
      >
        {options.map((option) => (
          <ToggleButton key={option.value} value={option.value}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Paper
                  elevation={0}
                  sx={(theme) => ({
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    backgroundColor: "rgba(0,32,96,0.08)",
                    border: "1px solid rgba(0,32,96,0.2)",
                    color: "inherit",
                    transition: "all 0.2s ease",
                    ...(theme.palette.mode === "dark" ? { backgroundColor: "rgba(255,255,255,0.08)" } : {}),
                    ".Mui-selected &": {
                      backgroundColor: "rgba(255,255,255,0.14)",
                      borderColor: "rgba(255,255,255,0.5)",
                      color: "#ffffff",
                    },
                  })}
                >
                  {option.icon}
                </Paper>
                <Stack alignItems="flex-start" spacing={0.25}>
                <Typography className="deal-label" fontWeight={700} color="inherit">
                  {option.label}
                </Typography>
                <Typography className="deal-helper" variant="caption" sx={{ color: "inherit", opacity: 0.75 }}>
                  {option.helper}
                </Typography>
                </Stack>
              </Stack>
            </ToggleButton>
          ))}
          </ToggleButtonGroup>
        {rightContent && (
          <Box
            sx={{
              width: { xs: "100%", md: "auto" },
              alignSelf: { xs: "stretch", md: "center" },
              display: "flex",
              justifyContent: { xs: "center", md: "flex-start" },
            }}
          >
            {rightContent}
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default DealsFilters;
