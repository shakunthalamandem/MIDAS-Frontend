import React from "react";
import { Box, TextField, Typography } from "@mui/material";

const MonasheeS3InputFields = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: 3,
        maxWidth: 1200, // Adjust to control the width of the form
      }}
    >
      {["Alloc % DealSize", "Alloc % IOI", "Hold Period"].map((label) => (
        <Box
          key={label}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "nowrap", // Ensure single row
          }}
        >
          {/* Label */}
          <Typography
            variant="body2"
            sx={{ fontSize: "0.8rem",color:'#5a5959' }} // Adjust width for consistent alignment
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
            sx={{ width: "100px" }} // Adjust width as needed
          />
          <TextField
            label="Max"
            variant="outlined"
            type="number"
            size="small"
            InputProps={{ inputProps: { min: 0 } }}
            sx={{ width: "100px" }} // Adjust width as needed
          />
        </Box>
      ))}
    </Box>
  );
};

export default MonasheeS3InputFields;
