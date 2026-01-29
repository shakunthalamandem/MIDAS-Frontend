import React from "react";
import { Paper, Box, Typography, Button, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

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
            variant="h2"
            sx={{ fontWeight: 700, lineHeight: 1.15 ,color:"#600e79ff"}}
            title={activePayload?.company_name || activePayload?.issuer_name}
          >
            {activePayload?.company_name || activePayload?.issuer_name || "—"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              mt: 0.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color:"#22252a"
            }}
          >
            {activePayload?.ticker || "N/A"} • US
          </Typography>
        </Box>

        {/* Right */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          {SearchComponent}
        </Box>
      </Box>

      {/* ROW 2 */}
      {/* <Box
        sx={(theme) => ({
          px: 2,
          py: 1.25,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
          gap: 1,
          alignItems: "center",
          backgroundColor: alpha(theme.palette.background.default, 0.35),
        })}
      >
        <MetaItem
          icon={<CalendarMonthOutlinedIcon fontSize="small" />}
          label="Pricing"
          value={formatDate(activePayload?.pricing_date)}
        />

        <MetaItem
          icon={<LocalOfferOutlinedIcon fontSize="small" />}
          label="Deal"
          value={activePayload?.deal_type}
        />

        <MetaItem
          icon={<BusinessOutlinedIcon fontSize="small" />}
          label="Region"
          value={activePayload?.region || activePayload?.country}
        />

        <MetaItem
          icon={<CategoryOutlinedIcon fontSize="small" />}
          label="Sector"
          value={activePayload?.sector || activePayload?.sectors}
        />
      </Box> */}
    </Paper>
  );
};

const MetaItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string;
}> = ({ icon, label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: { xs: "flex-start", md: "center" },
      gap: 0.75,
      minWidth: 0,
    }}
  >
    {icon}
    <Typography
      variant="caption"
      sx={{ fontWeight: 600, color: "text.secondary" }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        fontWeight: 600,
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {value || "—"}
    </Typography>
  </Box>
);

export default DealHeaderCard;
