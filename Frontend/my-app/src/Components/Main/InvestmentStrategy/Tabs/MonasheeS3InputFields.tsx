import React from "react";
import { Box, TextField, Typography, Grid } from "@mui/material";

const MonasheeS3InputFields = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: 3,
        margin: "0 auto",
        maxWidth: 600, // Adjust to control the width of the form
      }}
    >
      {["Alloc % DealSize", "Alloc % IOI", "Hold Period"].map((label) => (
        <Grid
          key={label}
          container
          alignItems="center"
          spacing={2}
          sx={{ flexWrap: "nowrap" }} // Ensure single row
        >
          {/* Label */}
          <Grid item xs={4}>
            <Typography
              variant="body2"
              color="#333"
              sx={{ fontSize: "0.9rem" }}
            >
              {label}
            </Typography>
          </Grid>

          {/* Input fields */}
          <Grid item xs={8} container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Min"
                variant="outlined"
                type="number"
                size="small"
                InputProps={{ inputProps: { min: 0 } }}
                style={{ width: "80px" }} // Adjust width as needed
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Max"
                variant="outlined"
                type="number"
                size="small"
                InputProps={{ inputProps: { min: 0 } }}
                style={{ width: "80px" ,fontSize:"0.7rem"}} 
              />
            </Grid>
          </Grid>
        </Grid>
      ))}
    </Box>
  );
};

export default MonasheeS3InputFields;
