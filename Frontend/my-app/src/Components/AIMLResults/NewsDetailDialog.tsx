import React from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Chip,
  Divider,
  Button,
  Stack,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ArticleIcon from "@mui/icons-material/Article";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import StarsRoundedIcon from "@mui/icons-material/StarsRounded";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import { alpha } from "@mui/material/styles";

export type ApiNewsItem = {
  id: number;
  ticker: string;
  date?: string; // "2025-12-23"
  gmt_time?: string; // "03:18:33"
  title: string;
  ai_summary?: string;
  source_url?: string;

  sentiment?: "Positive" | "Neutral" | "Negative" | string;
  polarity?: number;
  positive_score?: number;
  neutral_score?: number;
  negative_score?: number;
};

interface NewsDetailDialogProps {
  open: boolean;
  news: ApiNewsItem | null;
  onClose: () => void;
  onGoToAllNews?: (ticker?: string) => void;
}

function sentimentTone(
  sentiment?: string
): "success" | "warning" | "error" | "default" {
  const s = (sentiment || "").toLowerCase();
  if (s.includes("positive")) return "success";
  if (s.includes("negative")) return "error";
  if (s.includes("neutral")) return "warning";
  return "default";
}

function formatTimestamp(date?: string, time?: string) {
  if (!date && !time) return "—";
  if (date && time) return `${date} • ${time} GMT`;
  if (date) return date;
  return `${time} GMT`;
}

const ScoreTooltipTable: React.FC<{ news: ApiNewsItem }> = ({ news }) => {
  const rows: Array<{ label: string; value?: number }> = [
    { label: "Polarity", value: news.polarity },
    { label: "Positive", value: news.positive_score },
    { label: "Neutral", value: news.neutral_score },
    { label: "Negative", value: news.negative_score },
  ].filter((r) => typeof r.value === "number");

  return (
    <Box sx={{ p: 1 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color: "text.secondary" }}
      >
        Sentiment breakdown
      </Typography>

      <Table size="small" sx={{ mt: 0.75 }}>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.label}>
              <TableCell
                sx={{
                  borderBottom: "none",
                  py: 0.35,
                  pr: 2,
                  color: "text.secondary",
                  fontSize: 12,
                }}
              >
                {r.label}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  borderBottom: "none",
                  py: 0.35,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                {typeof r.value === "number" ? r.value.toFixed(3) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

const NewsDetailDialog: React.FC<NewsDetailDialogProps> = ({
  open,
  news,
  onClose,
  onGoToAllNews,
}) => {
  const tone = sentimentTone(news?.sentiment);
  const ts = formatTimestamp(news?.date, news?.gmt_time);

  const hasBreakdown =
    typeof news?.polarity === "number" ||
    typeof news?.positive_score === "number" ||
    typeof news?.neutral_score === "number" ||
    typeof news?.negative_score === "number";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: (theme) => ({
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
          backgroundImage:
            theme.palette.mode === "light"
              ? `linear-gradient(180deg, ${alpha(
                  theme.palette.info.main,
                  0.05
                )}, ${theme.palette.background.paper})`
              : "none",
        }),
      }}
    >
      <DialogTitle sx={{ pr: 6, pb: 1.25, position: "relative" }}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <ArticleIcon fontSize="small" />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                lineHeight: 1.25,
                pr: 10, // space for sentiment chip
              }}
            >
              {news?.title ?? "News"}
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", sm: "center" }}
              sx={{ mt: 0.75 }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                {ts}
                {news?.ticker ? ` • ${news.ticker}` : ""}
              </Typography>

              {hasBreakdown && news && (
                <Tooltip
                  placement="bottom-start"
                  title={<ScoreTooltipTable news={news} />}
                  componentsProps={{
                    tooltip: {
                      sx: (theme) => ({
                        bgcolor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        border: `1px solid ${alpha(
                          theme.palette.divider,
                          0.9
                        )}`,
                        boxShadow: `0 14px 34px ${alpha(
                          theme.palette.common.black,
                          0.16
                        )}`,
                        borderRadius: 2,
                        p: 0,
                      }),
                    },
                  }}
                >
                  <Chip
                    label="Sentiment breakdown"
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Tooltip>
              )}
            </Stack>
          </Box>
        </Stack>

        {/* Sentiment pinned top-right */}
        <Chip
          label={news?.sentiment ? news.sentiment : "—"}
          color={tone === "default" ? undefined : tone}
          variant={tone === "default" ? "outlined" : "filled"}
          size="small"
          sx={{
            position: "absolute",
            right: 52,
            top: 14,
            fontWeight: 600,
          }}
        />

        <IconButton
          onClick={onClose}
          aria-label="close"
          sx={{ position: "absolute", right: 12, top: 10 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Divider sx={{ mb: 2, opacity: 0.6 }} />

        {/* AI Summary Only */}
        <Box
          sx={(theme) => ({
            borderRadius: 2.5,
            border: `1px solid ${alpha(theme.palette.info.main, 0.28)}`,
            background:
              theme.palette.mode === "light"
                ? `linear-gradient(180deg, ${alpha(
                    theme.palette.info.main,
                    0.08
                  )}, ${theme.palette.background.paper})`
                : alpha(theme.palette.info.main, 0.12),
            p: 2,
            position: "relative",
            overflow: "hidden",
          })}
        >
          {/* subtle accent glow */}
          <Box
            sx={(theme) => ({
              position: "absolute",
              inset: -40,
              background: `radial-gradient(circle at 18% 10%, ${alpha(
                theme.palette.info.main,
                0.20
              )}, transparent 46%)`,
              pointerEvents: "none",
            })}
          />

          {/* Header row */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ position: "relative" }}
          >
            <Box
              sx={(theme) => ({
                width: 30,
                height: 30,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                border: `1px solid ${alpha(theme.palette.info.main, 0.30)}`,
                backgroundColor:
                  theme.palette.mode === "light"
                    ? alpha(theme.palette.info.main, 0.10)
                    : alpha(theme.palette.info.main, 0.18),
              })}
            >
              <AutoAwesomeOutlinedIcon fontSize="small" />
            </Box>

            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                letterSpacing: 0.25,
                color: "text.primary",
              }}
            >
              AI Generated Summary
            </Typography>
            <Box sx={{ flex: 1 }} />
          </Stack>

          {/* Summary text */}
          <Typography
            variant="body2"
            sx={{
              mt: 1.25,
              whiteSpace: "pre-line",
              lineHeight: 1.65,
              fontWeight: 400,
              color: "text.primary",
              position: "relative",
            }}
          >
            {news?.ai_summary?.trim()
              ? news.ai_summary.trim()
              : "No AI summary available."}
          </Typography>

          {/* Friendly CTA */}
          <Box
            sx={{
              mt: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              position: "relative",
            }}
          >
            <LinkOutlinedIcon fontSize="small" />
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 600 }}
            >
              Want the full article? Click{" "}
              <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                Open source
              </Box>{" "}
              below.
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ mt: 2 }}
          justifyContent="flex-end"
        >
          {news?.source_url && (
            <Button
              variant="outlined"
              onClick={() =>
                window.open(news.source_url!, "_blank", "noopener,noreferrer")
              }
              endIcon={<OpenInNewIcon />}
              sx={(theme) => ({
                borderRadius: 2,
                fontWeight: 600,
                textTransform: "none",
                borderColor: alpha(theme.palette.info.main, 0.35),
                "&:hover": {
                  borderColor: alpha(theme.palette.info.main, 0.6),
                  backgroundColor: alpha(theme.palette.info.main, 0.06),
                },
              })}
            >
              Open source
            </Button>
          )}

          <Button
            variant="contained"
            onClick={() => onGoToAllNews?.(news?.ticker)}
            sx={{ borderRadius: 2, fontWeight: 600, textTransform: "none" }}
          >
            View all news
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default NewsDetailDialog;
