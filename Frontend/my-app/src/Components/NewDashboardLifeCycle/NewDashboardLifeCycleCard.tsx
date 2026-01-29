import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import MemoryOutlinedIcon from "@mui/icons-material/MemoryOutlined";
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
  secondaryTag?: DealCardTag;
  onViewDetails?: () => void;
};

const DealCard: React.FC<DealCardProps> = ({
  title,
  subtitle,
  meta,
  tags,
  secondaryTag,
  onViewDetails,
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
  const actionCards = [
    { label: "Write Up", icon: <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />, bg: "#cfd6ff", tone: "#000000ff" },
    { label: "AI Sentiment View", icon: <PsychologyOutlinedIcon sx={{ fontSize: 16 }} />, bg: "#dffbff", tone: "#000000ff" },
    { label: "AI Unsupervised", icon: <AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />, bg: "#f3eaff", tone: "#000000ff" },
    { label: "ML Model", icon: <MemoryOutlinedIcon sx={{ fontSize: 16 }} />, bg: "#f5f8dc", tone: "#000000ff" },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid #f3faff",
        backgroundColor: "#f3faff",
        boxShadow: "0 18px 40px rgba(37, 44, 97, 0.12)",
        height: "100%",
        minHeight: { xs: 470, sm: 500 },
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
              }}
            >
              {title}
            </Typography>
            {subtitle ? (
              <Typography
                variant="body2"
                sx={{ color: "#68708a", fontWeight: 600, wordBreak: "break-word", mt: 0.2 }}
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {secondaryTag ? (
            <Chip
              label={secondaryTag.label}
              size="small"
              sx={{
                bgcolor: secondaryTag.bg ?? "#eef2ff",
                color: secondaryTag.color ?? "#3b52e5",
                fontWeight: 700,
                borderRadius: 999,
              }}
            />
          ) : null}
        </Stack>

        {tags?.length ? (
          <Stack direction="row" spacing={0.8} flexWrap="wrap">
            {tags.map((tag) => (
              <Chip
                key={tag.label}
                label={tag.label}
                size="small"
                sx={{
                  bgcolor: tag.bg ?? "#eef2ff",
                  color: tag.color ?? "#3b52e5",
                  fontWeight: 600,
                  borderRadius: 999,
                }}
              />
            ))}
          </Stack>
        ) : null}

        <Grid container spacing={1.2}>
          {actionCards.map((item) => (
            <Grid item xs={6} key={item.label}>
              <Box
                sx={{
                  borderRadius: 2.5,
                  backgroundColor: item.bg,
                  color: item.tone,
                  p: 0.7,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.3,
                  alignItems: "center",
                  textAlign: "center",
                  minHeight: 56,
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    display: "grid",
                    placeItems: "center",
                    color: item.tone,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
                  {item.label}
                </Typography>
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
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#17203d" }}>
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
              backgroundColor: "#eef3ff",
              p: 1.4,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.2,
            }}
          >
            {barMeta.map((item) => (
              <Box key={item.label}>
                <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: 700 }}>
                  {item.label}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: "#19213e" }}>
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
                    backgroundColor: "#3b52e5",
                    display: "grid",
                    placeItems: "center",
                    color: "#ffffff",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: 700 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#1f2a44" }}>
                    {item.value}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        ) : null}

        {onViewDetails && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 0.5 }}>
            <Button
              onClick={onViewDetails}
              variant="contained"
              sx={{
                textTransform: "none",
                borderRadius: 999,
                px: 3,
                py: 0.7,
                background: "linear-gradient(135deg, #4055e6 0%, #283bba 100%)",
                boxShadow: "0 10px 20px rgba(64, 85, 230, 0.35)",
                fontWeight: 700,
              }}
            >
              View Details
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DealCard;
