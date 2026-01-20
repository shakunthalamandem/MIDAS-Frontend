import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
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
};

const DealCard: React.FC<DealCardProps> = ({
  title,
  subtitle,
  meta,
  tags,
  secondaryTag,
}) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      border: "1px solid rgba(203,213,225,0.8)",
      background: "linear-gradient(180deg, #ffffff, #f7f9ff)",
      boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
      height: "100%",
    }}
  >
    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0b1844" }}>
          {title}
        </Typography>
        {tags?.length ? (
          <Stack
            direction="row"
            spacing={0.5}
            flexWrap="wrap"
            justifyContent="flex-end"
          >
            {tags.map((tag) => (
              <Chip
                key={tag.label}
                label={tag.label}
                size="small"
                sx={{
                  bgcolor: tag.bg ?? "#eef2ff",
                  color: tag.color ?? "#1d4ed8",
                  fontWeight: 600,
                }}
              />
            ))}
          </Stack>
        ) : null}
      </Stack>
      {(subtitle || secondaryTag) && (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {subtitle ? (
            <Typography variant="body2" sx={{ color: "#475569", fontWeight: 500 }}>
              {subtitle}
            </Typography>
          ) : null}
          {secondaryTag ? (
            <Chip
              label={secondaryTag.label}
              size="small"
              sx={{
                bgcolor: secondaryTag.bg ?? "#eef2ff",
                color: secondaryTag.color ?? "#1d4ed8",
                fontWeight: 600,
              }}
            />
          ) : null}
        </Stack>
      )}
      <Divider />
      <Grid container spacing={1.5}>
        {meta.map((item) => (
          <Grid item xs={12} sm={6} key={item.label}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  backgroundColor: "#e8edff",
                  display: "grid",
                  placeItems: "center",
                  color: "#1d4ed8",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#64748b", fontWeight: 600 }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#0f172a" }}
                >
                  {item.value}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </CardContent>
  </Card>
);

export default DealCard;
