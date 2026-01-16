import React from "react";
import { Box, Stack, Typography } from "@mui/material";

export const sectionCardSx = {
  Padding: 2,
  borderRadius: 2,
  border: "1px solid #d3dbf0",
  backgroundColor: "#ffffff",
  boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
  height: "100%",
  width: "100%",
  display: "flex",
  flexDirection: "column",
};

export const checkboxSx = {
  color: "#0b2a6f",
  "&.Mui-checked": {
    color: "#0b2a6f",
  },
};

export const readOnlyFieldSx = {
  "& .MuiInputBase-root.Mui-disabled": {
    color: "#1a2b5a",
    WebkitTextFillColor: "#1a2b5a",
    opacity: 1,
    backgroundColor: "#ffffff",
  },
};

export const headingColor = "#0b2a6f";
export const headerBg = "#0b2a6f";
export const uiFontFamily = "'Inter', system-ui, sans-serif";

type SectionHeaderProps = {
  icon: React.ReactNode;
  title: string;
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title }) => (
  <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        backgroundColor: "rgba(255,255,255,0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
      }}
    >
      {icon}
    </Box>
    <Typography
      variant="h6"
      fontWeight={700}
      color="#ffffff"
      sx={{ fontSize: "1rem", fontFamily: uiFontFamily }}
    >
      {title}
    </Typography>
  </Stack>
);
