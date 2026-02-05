import React from "react";
import { Paper, Box, Typography, Button } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface DealHeaderCardProps {
  activePayload: any;
  formatDate: (date?: string) => string;
  onBack: () => void;
  SearchComponent: React.ReactNode;
}

const DealHeaderCard: React.FC<DealHeaderCardProps> = ({
  activePayload,
  formatDate,
  onBack,
  SearchComponent,
}) => {
  return (
    <Paper
      elevation={0}
      sx={() => ({
        mb: 3,
        borderRadius: 0,
        overflow: "visible",
        background: "transparent",
        boxShadow: "none",
        border: "none",
      })}
    >
      {/* ROW 1 */}
      <Box
        sx={(theme) => ({
          px: 2,
          py: 1.5,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 2fr 1fr" },
          alignItems: "center",
          gap: 1.5,
          borderBottom: "none",
          backgroundColor: "transparent",
        })}
      >
        {/* Left */}
        <Box>
          <Button
            variant="outlined"
            onClick={onBack}
            startIcon={<ArrowBackIcon />}
            sx={(theme) => ({
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              // borderColor: alpha(theme.palette.divider, 0.9),
              "&:hover": {
                backgroundColor: alpha(theme.palette.info.main, 0.06),
              },
            })}
          >
            Back
          </Button>
        </Box>

        {/* Center */}
        <Box sx={{ textAlign: "center", minWidth: 0 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, lineHeight: 1.15, color: "#600e79ff" }}
            title={activePayload?.company_name || activePayload?.issuer_name}
          >
            {activePayload?.company_name || activePayload?.issuer_name || "—"}
          </Typography>

          <Typography
            variant="body2"
            color="#000000"
            sx={{
              fontWeight: 600,
              mt: 0.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "#22252a",
            }}
          >
            {activePayload?.ticker || "N/A"} 
          </Typography>
        </Box>

        {/* Right */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          {SearchComponent}
        </Box>
      </Box>
    </Paper>
  );
};


export default DealHeaderCard;
