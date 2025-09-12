import React from "react";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Tooltip,
} from "@mui/material";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";

interface FormSwitcherProps {
  selectedType: "IPO" | "FO";
  onChangeType: (type: "IPO" | "FO") => void;
  ipoCount?: number; // optional: recent IPO count to show as a tiny badge
  foCount?: number;  // optional: recent FO count to show as a tiny badge
}

const FormSwitcher: React.FC<FormSwitcherProps> = ({
  selectedType,
  onChangeType,
  ipoCount,
  foCount,
}) => {
  const handleToggle = (_: React.MouseEvent<HTMLElement>, next: "IPO" | "FO" | null) => {
    if (next) onChangeType(next);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: { xs: "center", sm: "flex-start" },
        mb: 2,
      }}
    >
      <Box
        sx={{
          p: 0.5,
          borderRadius: 999,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: (t) => (t.palette.mode === "light" ? 1 : 0),
        }}
      >
        <ToggleButtonGroup
          value={selectedType}
          exclusive
          onChange={handleToggle}
          aria-label="Select deal type"
          sx={{
            "& .MuiToggleButton-root": {
              textTransform: "none",
              fontWeight: 700,
              border: "none",
              px: 2,
              py: 1,
              borderRadius: 999,
              transition: "background-color 120ms, transform 80ms",
              "&:not(.Mui-selected):hover": {
                backgroundColor: "action.hover",
              },
              "&.Mui-selected": {
                color: "#fff",
                backgroundImage: (t) =>
                  t.palette.mode === "light"
                    ? "linear-gradient(90deg, #0047AB 0%, #0078D4 100%)"
                    : "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
                "&:hover": {
                  filter: "brightness(1.02)",
                },
              },
              "&:active": { transform: "translateY(1px)" },
            },
          }}
        >
          <ToggleButton value="IPO" aria-label="IPO" disableRipple>
            <RocketLaunchOutlinedIcon
              fontSize="small"
              sx={{ mr: 1, opacity: selectedType === "IPO" ? 1 : 0.8 }}
            />
            IPO
            {typeof ipoCount === "number" && (
              <Chip
                label={ipoCount}
                size="small"
                sx={{
                  ml: 1,
                  height: 18,
                  fontSize: 11,
                  color: selectedType === "IPO" ? "#fff" : "text.secondary",
                  bgcolor: selectedType === "IPO" ? "rgba(255,255,255,0.18)" : "action.hover",
                }}
              />
            )}
          </ToggleButton>

          <ToggleButton value="FO" aria-label="FO" disableRipple>
            <PaidOutlinedIcon
              fontSize="small"
              sx={{ mr: 1, opacity: selectedType === "FO" ? 1 : 0.8 }}
            />
            FO
            {typeof foCount === "number" && (
              <Chip
                label={foCount}
                size="small"
                sx={{
                  ml: 1,
                  height: 18,
                  fontSize: 11,
                  color: selectedType === "FO" ? "#fff" : "text.secondary",
                  bgcolor: selectedType === "FO" ? "rgba(255,255,255,0.18)" : "action.hover",
                }}
              />
            )}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Optional subtle hint (hover) */}
      {/* <Tooltip title="Switch forms. Recent predictions on the right will follow this filter." arrow>
        <Box sx={{ ml: 1.5, fontSize: 12, color: "text.secondary", display: { xs: "none", md: "block" } }}>
          IPO and FO use different inputs & models
        </Box>
      </Tooltip> */}
    </Box>
  );
};

export default FormSwitcher;
