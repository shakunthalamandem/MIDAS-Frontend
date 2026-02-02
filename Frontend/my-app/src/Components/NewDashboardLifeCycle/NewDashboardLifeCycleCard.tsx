import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { DealCardTag } from "./NewDashboardLifeCycleUtils";

export type DealCardMeta = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

type DealCardProps = {
  title: string;
  subtitle?: string;
  meta: DealCardMeta[];
  tags?: DealCardTag[];
  writeupAvailable?: boolean | null;
  onViewDetails?: () => void;
  onActionClick?: (label: string) => void;
};

const DealCard: React.FC<DealCardProps> = ({
  title,
  subtitle,
  meta,
  tags,
  writeupAvailable,
  onViewDetails,
  onActionClick,
}) => {
  const barMeta = meta.filter((item) =>
    /size|price range|valuation/i.test(item.label)
  );
  const dateMeta = meta.filter(
    (item) => /date/i.test(item.label) && !barMeta.includes(item)
  );
  const tileMeta = meta.filter(
    (item) => !barMeta.includes(item) && !dateMeta.includes(item)
  );
  const writeupStatus =
    writeupAvailable === true
      ? "Write Up Ready"
      : writeupAvailable === false
      ? "Write Up Not Ready"
      : null;
  const actionCards = [
    {
      label: "Write Up",
      icon: <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />,
      bg: "#eeeffcff",
      tone: "#4b5bff",
      status: writeupStatus,
    },
    { label: "ML Model", icon: <PsychologyOutlinedIcon sx={{ fontSize: 16 }} />, bg: "#eaf5faff", tone: "#2e7fb0", },
    // { label: "AI Unsupervised", icon: <AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />, bg: "#eaf5faff", tone: "#2e7fb0", },
    // { label: "AI Sentiment View", icon: <MemoryOutlinedIcon sx={{ fontSize: 16 }} />, bg: "#eeeffcff", tone: "#4b5bff",  },
  ];

  return (
    <Card
      elevation={0}
      onClick={onViewDetails}
      sx={{
        borderRadius: 4,
        border: "1px solid #e5f0ff",
        backgroundColor: "#c2dbf0",
        boxShadow: "0 16px 34px rgba(27, 44, 90, 0.08)",
        height: "100%",
        minHeight: { xs: 400, sm: 300 },
        fontSize: "0.92rem",
        cursor: onViewDetails ? "pointer" : "default",
        transition: "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
        willChange: "transform, box-shadow",
        "&:hover": onViewDetails
          ? {
              transform: "translateY(-4px)",
              boxShadow: "0 22px 40px rgba(27, 44, 90, 0.16)",
            }
          : undefined,
        "&:focus-visible": onViewDetails
          ? {
              outlineOffset: 2,
            }
          : undefined,
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.6,
          p: { xs: 2.2, sm: 2.6 },
        }}
      >
        <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#162048",
                letterSpacing: 0.2,
                wordBreak: "break-word",
                fontSize: "1.05rem",
              }}
            >
              {title}
            </Typography>
          </Box>
          {tags?.length ? (
            <Stack direction="row" spacing={0.8} flexWrap="wrap" justifyContent="flex-end">
              {tags.map((tag) => (
                <Chip
                  key={tag.label}
                  label={tag.label}
                  size="small"
                  sx={{
                    bgcolor: tag.bg ?? "#e9edff",
                    color: tag.color ?? "#3348d0",
                    fontWeight: 700,
                    borderRadius: 999,
                    fontSize: "0.7rem",
                  }}
                />
              ))}
            </Stack>
          ) : null}
        </Stack>

        {subtitle ? (
          <Box sx={{ width: "100%" }}>
            <Typography
              variant="body2"
              sx={{
                color: "#000000ff",
                fontWeight: 300,
                fontSize: "0.78rem",
                wordBreak: "break-word",
              }}
            >
              {subtitle}
            </Typography>
          </Box>
        ) : null}

        <Grid container spacing={1.2}>
          {actionCards.map((item) => (
            <Grid item xs={6} key={item.label}>
              <Box
                onClick={(event) => {
                  event.stopPropagation();
                  onActionClick?.(item.label);
                }}
                onKeyDown={(event) => {
                  if (!onActionClick) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onActionClick(item.label);
                  }
                }}
                role={onActionClick ? "button" : undefined}
                tabIndex={onActionClick ? 0 : -1}
                sx={{
                  borderRadius: 2.5,
                  backgroundColor: item.bg,
                  // border: `1px solid ${item.border}`,
                  boxShadow: "0 6px 12px rgba(30, 41, 59, 0.06)",
                  color: "#0f172a",
                  p: 0.8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.3,
                  alignItems: "center",
                  textAlign: "center",
                  minHeight: 72,
                  justifyContent: "center",
                  cursor: onActionClick ? "pointer" : "default",
                  "&:hover": onActionClick
                    ? { boxShadow: "0 10px 18px rgba(30, 41, 59, 0.12)",
                      bgcolor:"#ceccf3ff"}
                    : undefined,
                    mt:2,
                    mb:2
                }}
              >
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    display: "grid",
                    placeItems: "center",
                    color: item.tone,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: "0.82rem" }}>
                  {item.label}
                </Typography>
                {item.status ? (
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      color: item.status === "Write Up Ready" ? "#0d883c" : "#991b1b",
                    }}
                  >
                    {item.status}
                  </Typography>
                ) : null}
              </Box>
            </Grid>
          ))}
        </Grid>

        {tileMeta.length > 0 ? (
          <Grid container spacing={1.2}>
            {tileMeta.map((item) => (
              <Grid item xs={6} key={item.label}>
                <Box
                  sx={{
                    borderRadius: 2.5,
                    backgroundColor: "#f2f5ff",
                    color: "#2f3a62",
                    p: 1.4,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.6,
                    alignItems: "center",
                    textAlign: "center",
                    minHeight: 86,
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      backgroundColor: "#e4e9ff",
                      display: "grid",
                      placeItems: "center",
                      color: "#3b52e5",
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {item.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "#17203d", fontSize: "0.95rem" }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : null}

        {barMeta.length > 0 ? (
          <Box
            sx={{
              borderRadius: 3,
              backgroundColor: "transparent",
              border: "1px solid #c7d2fe",
              p: 1.2,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1,
            }}
          >
            {barMeta.map((item) => (
              <Box key={item.label}>
                <Typography variant="caption" sx={{ color: "#505050ff", fontWeight: 700 }}>
                  {item.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "#1a2b5c", fontSize: "0.95rem" }}
                >
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : null}

        {dateMeta.length > 0 ? (
          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            flexWrap="wrap"
          >
            {dateMeta.map((item) => (
              <Stack key={item.label} direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    backgroundColor: "rgb(53, 15, 114)",
                    display: "grid",
                    placeItems: "center",
                    color: "#ffffff",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#505050ff", fontWeight: 700 }}>
                    {item.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "#1a2b5c", fontSize: "0.92rem" }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        ) : null}

        {onViewDetails && (
<Box
  sx={{
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 0.5,
    pt: 0.5,
  }}
>
  <Typography variant="body2" color="#002060" fontWeight={600}>View</Typography>

  <IconButton
    onClick={onViewDetails}
    aria-label="View details"
    sx={{
      backgroundColor: "#002060",
      color: "#ffffff",
      width: 20,
      height: 20,
      "&:hover": {
        backgroundColor: "#002060",
      },
    }}
  >
    <ArrowForwardIcon sx={{ fontSize: 14 }} />
  </IconButton>
</Box>

        )}
      </CardContent>
    </Card>
  );
};

export default DealCard;
