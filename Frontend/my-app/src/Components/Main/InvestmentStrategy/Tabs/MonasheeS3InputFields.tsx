import React from "react";
import { Box, TextField, Typography } from "@mui/material";

const MonasheeS3InputFields = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 2,
        padding: 3,
        paddingLeft:0,
        maxWidth: 1200,
      }}
    >
      {["Alloc % DealSize", "Alloc % IOI", "Hold Period"].map((label) => (
        <Box
          key={label}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexDirection: "row",
          }}
        >
          {/* Label */}
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.8rem",
              color: "#5a5959",
              width: "60px", // Ensure consistent alignment
            }}
          >
            {label}
          </Typography>

          {/* Input fields */}
          <TextField
            label="Min"
            variant="outlined"
            type="number"
            size="small"
            InputProps={{ inputProps: { min: 0 } }}
            sx={{
              width: { xs: "100%", sm: "80px" }, // Responsive width
            }}
          />
          <TextField
            label="Max"
            variant="outlined"
            type="number"
            size="small"
            InputProps={{ inputProps: { min: 0 } }}
            sx={{
              width: { xs: "100%", sm: "80px" }, // Responsive width
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

export default MonasheeS3InputFields;
