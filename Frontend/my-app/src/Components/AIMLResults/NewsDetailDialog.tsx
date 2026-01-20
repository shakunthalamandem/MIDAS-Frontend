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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ArticleIcon from "@mui/icons-material/Article";
import { alpha } from "@mui/material/styles";

export type ApiNewsItem = {
  id: number;
  ticker: string;
  date?: string;      // "2025-12-23"
  gmt_time?: string;  // "03:18:33" (optional; from your payload)
  title: string;
  ai_summary?: string;
  content?: string;
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

function sentimentTone(sentiment?: string): "success" | "warning" | "error" | "default" {
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

// light cleanup for long scraped content: keep readable paragraphs
function prettifyContent(raw?: string) {
  if (!raw) return "";
  // Normalize whitespace a bit but keep paragraphs.
  return raw
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const NewsDetailDialog: React.FC<NewsDetailDialogProps> = ({
  open,
  news,
  onClose,
  onGoToAllNews,
}) => {
  const tone = sentimentTone(news?.sentiment);
  const ts = formatTimestamp(news?.date, news?.gmt_time);
  const content = prettifyContent(news?.content);

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
              ? `linear-gradient(180deg, ${alpha(theme.palette.info.main, 0.06)}, ${theme.palette.background.paper})`
              : "none",
        }),
      }}
    >
      <DialogTitle sx={{ pr: 6, pb: 1.25 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <ArticleIcon fontSize="small" />
          <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
            {news?.title ?? "News"}
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mt: 1 }}
        >
          <Chip
            label={news?.sentiment ? `Sentiment: ${news.sentiment}` : "Sentiment: —"}
            color={tone === "default" ? undefined : tone}
            variant={tone === "default" ? "outlined" : "filled"}
            size="small"
            sx={{ fontWeight: 800 }}
          />

          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {ts}
            {news?.ticker ? ` • ${news.ticker}` : ""}
          </Typography>

          {(typeof news?.polarity === "number" ||
            typeof news?.positive_score === "number" ||
            typeof news?.neutral_score === "number" ||
            typeof news?.negative_score === "number") && (
            <Tooltip
              title={
                <Box sx={{ p: 0.5 }}>
                  {typeof news?.polarity === "number" && (
                    <Typography variant="caption" display="block">
                      Polarity: {news.polarity.toFixed(3)}
                    </Typography>
                  )}
                  {typeof news?.positive_score === "number" && (
                    <Typography variant="caption" display="block">
                      Positive: {news.positive_score.toFixed(3)}
                    </Typography>
                  )}
                  {typeof news?.neutral_score === "number" && (
                    <Typography variant="caption" display="block">
                      Neutral: {news.neutral_score.toFixed(3)}
                    </Typography>
                  )}
                  {typeof news?.negative_score === "number" && (
                    <Typography variant="caption" display="block">
                      Negative: {news.negative_score.toFixed(3)}
                    </Typography>
                  )}
                </Box>
              }
            >
              <Chip
                label="Signal details"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 800 }}
              />
            </Tooltip>
          )}
        </Stack>

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

        {/* AI Summary (first, because finance users want the synthesized takeaway) */}
        <Box
          sx={(theme) => ({
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.info.main, 0.25)}`,
            backgroundColor:
              theme.palette.mode === "light"
                ? alpha(theme.palette.info.main, 0.05)
                : alpha(theme.palette.info.main, 0.14),
            p: 2,
          })}
        >
          <Typography
            variant="overline"
            sx={{
              letterSpacing: 0.9,
              fontWeight: 900,
              color: "text.secondary",
            }}
          >
            AI summary
          </Typography>

          <Typography
            variant="body1"
            sx={{ mt: 0.75, whiteSpace: "pre-line", fontWeight: 550, lineHeight: 1.55 }}
          >
            {news?.ai_summary?.trim() ? news.ai_summary.trim() : "No AI summary available."}
          </Typography>
        </Box>

        {/* Full content */}
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="overline"
            sx={{ letterSpacing: 0.9, fontWeight: 900, color: "text.secondary" }}
          >
            Full article text
          </Typography>

          <Box
            sx={(theme) => ({
              mt: 0.75,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
              p: 2,
              maxHeight: 340,
              overflow: "auto",
              backgroundColor: alpha(theme.palette.background.default, 0.6),
            })}
          >
            <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>
              {content || "No content available."}
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
              onClick={() => window.open(news.source_url!, "_blank", "noopener,noreferrer")}
              endIcon={<OpenInNewIcon />}
              sx={{ borderRadius: 2 }}
            >
              Open source
            </Button>
          )}

          <Button
            variant="contained"
            onClick={() => onGoToAllNews?.(news?.ticker)}
            sx={{ borderRadius: 2, fontWeight: 900 }}
          >
            View all news
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default NewsDetailDialog;
