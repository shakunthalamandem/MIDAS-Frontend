import { Box, Typography } from "@mui/material";

const Legend = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        mt: 2,
        ml: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: "#002060",
          }}
        />
        <Typography variant="body2" color="text.secondary">
          A - Announced
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: "orange",
          }}
        />
        <Typography variant="body2" color="text.secondary">
          P - Priced
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: "green",
          }}
        />
        <Typography variant="body2" color="text.secondary">
          I - Issued
        </Typography>
      </Box>
    </Box>
  );
};

export default Legend;
