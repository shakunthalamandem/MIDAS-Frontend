import React from "react";
import { Box, Typography } from "@mui/material";
import dayjs from "dayjs";

interface Props {
  iso: string;
}

function humanDay(iso: string): string {
  const d = dayjs(iso);
  const today = dayjs().startOf("day");
  const that = d.startOf("day");
  const diff = today.diff(that, "day");
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return d.format("dddd");
  if (d.year() === dayjs().year()) return d.format("MMM D");
  return d.format("MMM D, YYYY");
}

const OpenClawDateDivider: React.FC<Props> = ({ iso }) => (
  <Box sx={{ display: "flex", justifyContent: "center", my: 1.25 }}>
    <Typography
      variant="caption"
      sx={{
        px: 1.25,
        py: 0.3,
        borderRadius: 999,
        backgroundColor: "rgba(15, 23, 42, 0.08)",
        color: "text.secondary",
        fontWeight: 600,
        letterSpacing: 0.3,
        fontSize: 11,
      }}
    >
      {humanDay(iso)}
    </Typography>
  </Box>
);

export default OpenClawDateDivider;
