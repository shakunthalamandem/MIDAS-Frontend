import { Box, Typography } from "@mui/material";

const Legend = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center", // center the whole legend horizontally
        gap: 3,
        mt: 2,
      }}
    >
      {[
        { color: "#002060", label: "A - Announced" },
        { color: "orange", label: "P - Priced" },
        { color: "green", label: "I - Issued" },
      ].map(({ color, label }) => (
        <Box
          key={label}
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: color,
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1 }}>
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default Legend;
