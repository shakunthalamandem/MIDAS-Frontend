import React from "react";
import {
  Stack,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

interface WriteUpFiltersProps {
  selectedOp: string;
  onChange: (value: string) => void;
}

const WriteUpFilters: React.FC<WriteUpFiltersProps> = ({
  selectedOp,
  onChange,
}) => {
  const options = ["all upcoming", "next 2 weeks", "September to Date"];

  return (
    <Stack
      direction="row"
      spacing={3}
      alignItems="center"
      justifyContent="center"
      sx={{ mb: 2 }}
    >
      <Typography
        variant="h6"
        color="#002060"
        fontWeight={600}
        sx={{ whiteSpace: "nowrap" }}
      >
        WriteUp Deals - Upcoming & Recent
      </Typography>

      <FormControl
        variant="outlined"
        sx={{
          minWidth: 160,
          "& .MuiInputBase-root": {
            height: 36, // Decrease Select height
            backgroundColor: "#f5f5f5", // Light background
            borderRadius: "8px",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#002060", // Border color
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#9c2007", // Hover border
          },
          "& .MuiSelect-icon": {
            color: "#002060", // Arrow color
          },
        }}
      >
        <Select
          value={selectedOp}
          onChange={(e) => onChange(e.target.value)}
          sx={{ fontSize: "0.9rem", color: "#002060" }}
        >
          {options.map((value) => (
            <MenuItem
              key={value}
              value={value}
              sx={{
                fontSize: "0.9rem",
                "&.Mui-selected": {
                  backgroundColor: "#00206020", // Light blue highlight
                },
                "&:hover": {
                  backgroundColor: "#9c200720", // Light red hover
                },
              }}
            >
              {value.replace(/^\w/, (c) => c.toUpperCase())}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};

export default WriteUpFilters;
