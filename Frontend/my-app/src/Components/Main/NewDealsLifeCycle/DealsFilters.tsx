import React from "react";
import { Box, Stack, ToggleButton, ToggleButtonGroup, Typography, Paper } from "@mui/material";

interface DealsFiltersProps {
  selectedOp: string;
  options: { value: string; label: string; helper: string; icon?: React.ReactNode }[];
  onChange: (value: string) => void;
  rightContent?: React.ReactNode;
}

const DealsFilters: React.FC<DealsFiltersProps> = ({
  selectedOp,
  options,
  onChange,
  rightContent,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1, md: 1.5 },
        borderRadius: 3,
        backgroundColor: "transparent",
        border: "1px solid transparent",
        boxShadow: "none",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        sx={{ width: "100%" }}
      >
        <ToggleButtonGroup
          value={selectedOp}
          exclusive
          onChange={(_e, value) => onChange(value ?? selectedOp)}
          sx={{
            flexWrap: "wrap",
            columnGap: 1,
            rowGap: 1,
            overflowX: "visible",
            maxWidth: "100%",
            flex: 1,
            minWidth: 0,
            "& .MuiToggleButton-root": {
              textTransform: "none",
              borderRadius: 999,
              border: "1px solid #d7ddea",
              backgroundColor: "#ffffff",
              minWidth: 0,
              height: 36,
              minHeight: 36,
              justifyContent: "center",
              px: 2,
              py: 0.4,
              color: "#1f2a44",
              position: "relative",
              overflow: "hidden",
              boxShadow: "none",
              transition: "all 0.2s ease",
            },
            "& .MuiToggleButton-root:hover:not(.Mui-selected)": {
              backgroundColor: "#2b146f",
              color: "#ffffff",
            },
            "& .Mui-selected": {
              borderColor: "#2b146f",
              backgroundColor: "#2b146f",
              boxShadow: "0 8px 18px rgba(43,20,111,0.18)",
              color: "#ffffff",
            },
            "& .MuiToggleButton-root.Mui-selected:hover": {
              backgroundColor: "#2b146f",
              color: "#ffffff",
            },
            "& .MuiToggleButton-root.Mui-selected:leave": {
              backgroundColor: "#2b146f",
              color: "#ffffff",
            },
            "& .MuiToggleButton-root.Mui-selected:after": {
              display: "none",
            },
            "& .deal-icon-box": {
              width: 20,
              height: 20,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              backgroundColor: "#eef2ff",
              color: "#5b6476",
              transition: "all 0.2s ease",
            },
            "& .Mui-selected .deal-icon-box": {
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "#ffffff",
            },
            "& .deal-label": {
              fontWeight: 700,
              color: "inherit",
            },
            "& .deal-helper": {
              display: "none",
            },
          }}
        >
          {options.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                {option.icon && <Box className="deal-icon-box">{option.icon}</Box>}
                <Box>
                  <Typography className="deal-label">{option.label}</Typography>
                  {option.helper && (
                    <Typography className="deal-helper" variant="caption">
                      {option.helper}
                    </Typography>
                  )}
                </Box>
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
              ml: { md: "auto" },
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
