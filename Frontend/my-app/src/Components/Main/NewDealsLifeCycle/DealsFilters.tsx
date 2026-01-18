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
              borderRadius: 2,
              border: "1px solid #e1e5ef",
              backgroundColor: "#ffffff",
              minWidth: 210,
              justifyContent: "flex-start",
              px: 2,
              py: 1,
              color: "#1f2a44",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 1px 2px rgba(15,23,42,0.05)",
              transition: "all 0.2s ease",
            },
            "& .MuiToggleButton-root:hover": {
              backgroundColor: "#f6f8fc",
            },
            "& .Mui-selected": {
              borderColor: "#c8c1e5",
              boxShadow: "0 10px 24px rgba(44,24,93,0.12)",
            },
            "& .MuiToggleButton-root.Mui-selected:after": {
              content: '""',
              position: "absolute",
              left: "22%",
              right: "22%",
              bottom: 0,
              height: 3,
              borderRadius: 999,
              backgroundColor: "#2b146f",
            },
            "& .deal-icon-box": {
              width: 34,
              height: 34,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              backgroundColor: "#eef1f6",
              color: "#5b6476",
              transition: "all 0.2s ease",
            },
            "& .Mui-selected .deal-icon-box": {
              backgroundColor: "#ece7f8",
              color: "#2b146f",
            },
            "& .deal-label": {
              fontWeight: 700,
              color: "inherit",
            },
            "& .deal-helper": {
              color: "#6a7286",
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
