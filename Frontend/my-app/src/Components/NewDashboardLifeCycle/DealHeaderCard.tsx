import React from "react";
import { Paper, Box, Typography, Button } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

interface DealHeaderCardProps {
  activePayload: any;
  formatDate: (date?: string) => string;
  onBack: () => void;
  SearchComponent: React.ReactNode;
  onDealBotClick?: () => void;
  isDealBotActive?: boolean;
}

const DealHeaderCard: React.FC<DealHeaderCardProps> = ({
  activePayload,
  formatDate,
  onBack,
  SearchComponent,
  onDealBotClick,
  isDealBotActive = false,
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
              "&:hover": {
                backgroundColor: alpha(theme.palette.info.main, 0.06),
              },
            })}
          >
            Back
          </Button>
        </Box>

        <Box sx={{ textAlign: "center", minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: { xs: 1.5, sm: 2.8 },
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, lineHeight: 1.15, color: "#600e79ff" }}
              title={activePayload?.company_name || activePayload?.issuer_name}
            >
              {activePayload?.company_name || activePayload?.issuer_name || "-"}
            </Typography>
            {onDealBotClick ? (
              <Button
                size="small"
                variant={isDealBotActive ? "contained" : "outlined"}
                onClick={onDealBotClick}
                sx={{
                  ml: { xs: 0, sm: 0 },
                  mt: { xs: 0.5, sm: 0 },
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: 0.2,
                  px: 2.25,
                  py: 0.62,
                  minWidth: "auto",
                  position: "relative",
                  overflow: "visible",
                  isolation: "isolate",
                  background: isDealBotActive
                    ? "linear-gradient(135deg, #1c3faa 0%, #1866c8 55%, #1f82d6 100%)"
                    : "linear-gradient(135deg, #1f4db7 0%, #2573d2 55%, #3896ea 100%)",
                  borderColor: isDealBotActive ? "#1d4fb5" : "#2a74d2",
                  color: "#ffffff",
                  boxShadow: isDealBotActive
                    ? "0 8px 18px rgba(28, 63, 170, 0.42)"
                    : "0 6px 14px rgba(35, 104, 203, 0.34)",
                  backdropFilter: "blur(2px) saturate(120%)",
                  filter: "brightness(1) saturate(1)",
                  animation:
                    "dealBotFilterPulse 2.4s ease-in-out infinite, dealBotFloat 2.8s ease-in-out infinite",
                  "@keyframes dealBotFilterPulse": {
                    "0%": { filter: "brightness(1) saturate(1)" },
                    "50%": { filter: "brightness(1.06) saturate(1.16)" },
                    "100%": { filter: "brightness(1) saturate(1)" },
                  },
                  "@keyframes dealBotFloat": {
                    "0%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-2px)" },
                    "100%": { transform: "translateY(0px)" },
                  },
                  transition:
                    "background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: -4,
                    borderRadius: 999,
                    border: isDealBotActive
                      ? "1.5px solid rgba(122, 146, 255, 0.55)"
                      : "1.5px solid rgba(122, 146, 255, 0.45)",
                    pointerEvents: "none",
                    zIndex: 0,
                    animation: "dealBotRing 1.9s ease-out infinite",
                  },
                  "@keyframes dealBotRing": {
                    "0%": { transform: "scale(1)", opacity: 0.82 },
                    "100%": { transform: "scale(1.1)", opacity: 0 },
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    borderRadius: 999,
                    background:
                      "linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.18) 48%, rgba(255,255,255,0) 76%)",
                    transform: "translateX(-140%)",
                    animation: "dealBotShimmer 2.8s linear infinite",
                    pointerEvents: "none",
                    zIndex: 0,
                  },
                  "@keyframes dealBotShimmer": {
                    "0%": { transform: "translateX(-140%)" },
                    "100%": { transform: "translateX(180%)" },
                  },
                  "& .MuiButton-startIcon": {
                    mr: 0.75,
                  },
                  "& .MuiButton-endIcon": {
                    ml: 0.25,
                  },
                  "& .dealBotSparkle": {
                    ml: 0.45,
                    display: "inline-flex",
                    animation: "dealBotSparklePulse 1.45s ease-in-out infinite",
                  },
                  "@keyframes dealBotSparklePulse": {
                    "0%": { transform: "scale(0.92)", opacity: 0.75 },
                    "50%": { transform: "scale(1.15)", opacity: 1 },
                    "100%": { transform: "scale(0.92)", opacity: 0.75 },
                  },
                  "& .MuiButton-startIcon, & .MuiButton-endIcon, & .dealBotText, & .dealBotSparkle": {
                    position: "relative",
                    zIndex: 1,
                  },
                  "&:hover": {
                    background: isDealBotActive
                      ? "linear-gradient(135deg, #163a98 0%, #155cb6 55%, #1e7fcd 100%)"
                      : "linear-gradient(135deg, #1c44a4 0%, #2266c2 55%, #2f88da 100%)",
                    borderColor: isDealBotActive ? "#163a98" : "#2266c2",
                    boxShadow: "0 10px 20px rgba(27, 92, 189, 0.42)",
                    transform: "translateY(-1px)",
                    filter: "brightness(1.08) saturate(1.2)",
                  },
                }}
                startIcon={
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="50" height="50" aria-hidden="true">
                      <path
                        d="M4.5 10.2c0-3 2.8-5.4 6.2-5.4s6.2 2.4 6.2 5.4-2.8 5.4-6.2 5.4c-.7 0-1.3-.1-1.9-.2l-2.8 2 .8-2.9c-1.4-.9-2.3-2.5-2.3-4.3z"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="9.1" cy="10.2" r="1.05" fill="#ffffff" />
                      <circle cx="11.9" cy="10.2" r="1.05" fill="#ffffff" />
                      <circle cx="14.7" cy="10.2" r="1.05" fill="#ffffff" />
                    </svg>
                  </Box>
                }
              >
                <Box component="span" className="dealBotText">
                  Deal Bot
                </Box>
                <Box component="span" className="dealBotSparkle">
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 14 }} />
                </Box>
              </Button>
            ) : null}
          </Box>

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
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>{SearchComponent}</Box>
      </Box>
    </Paper>
  );
};

export default DealHeaderCard;
