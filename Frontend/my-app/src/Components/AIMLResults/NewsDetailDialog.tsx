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
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ArticleIcon from "@mui/icons-material/Article";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { alpha } from "@mui/material/styles";

export type ApiNewsItem = {
  id: number;
  ticker: string;
  date?: string; // "2025-12-23"
  gmt_time?: string; // "03:18:33"
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

function splitIntoParagraphs(raw?: string): string[] {
  if (!raw) return [];

  return raw
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .split(/\n{2,}/) // split on blank lines
    .map((p) => p.trim())
    .filter((p) => p.length > 20); // remove tiny/noise fragments
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

function prettifyContent(raw?: string) {
  if (!raw) return "";
  return raw
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const ScoreTooltipTable: React.FC<{ news: ApiNewsItem }> = ({ news }) => {
  const rows: Array<{ label: string; value?: number }> = [
    { label: "Polarity", value: news.polarity },
    { label: "Positive", value: news.positive_score },
    { label: "Neutral", value: news.neutral_score },
    { label: "Negative", value: news.negative_score },
  ].filter((r) => typeof r.value === "number");

  return (
    <Box sx={{ p: 0.5 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color: "text.secondary" }}
      >
        Sentiment breakdown
      </Typography>

      <Table size="small" sx={{ mt: 0.5 }}>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.label}>
              <TableCell
                sx={{
                  borderBottom: "none",
                  py: 0.35,
                  pr: 1,
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
  const content = prettifyContent(news?.content);
  const paragraphs = splitIntoParagraphs(content);

  const [showSummary, setShowSummary] = React.useState(false);

  React.useEffect(() => {
    // reset summary state when switching articles/opening
    if (open) setShowSummary(false);
  }, [open, news?.id]);

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
      // slightly wider + more horizontal feel
      maxWidth="lg"
      PaperProps={{
        sx: (theme) => ({
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
          backgroundImage:
            theme.palette.mode === "light"
              ? `linear-gradient(180deg, ${alpha(theme.palette.info.main, 0.05)}, ${theme.palette.background.paper})`
              : "none",
        }),
      }}
    >
      <DialogTitle sx={{ pr: 6, pb: 1.25, position: "relative" }}>
        {/* Title row */}
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <ArticleIcon fontSize="small" />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                lineHeight: 1.25,
                pr: 10, // space for sentiment chip on the right
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

              {hasBreakdown && (
                <Tooltip
                  placement="bottom-start"
                  title={news ? <ScoreTooltipTable news={news} /> : ""}
                  componentsProps={{
                    tooltip: {
                      sx: (theme) => ({
                        bgcolor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                        boxShadow: `0 14px 34px ${alpha(theme.palette.common.black, 0.16)}`,
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

        {/* Two-column layout on desktop for a more horizontal feel */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: showSummary ? "1.25fr 0.75fr" : "1fr",
            },
            gap: 2,
            alignItems: "start",
          }}
        >
          {/* LEFT: Full article (default) */}
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: 0.8,
                  fontWeight: 600,
                  color: "text.secondary",
                }}
              >
                Full article
              </Typography>

              <Box sx={{ flex: 1 }} />

              <Button
                size="small"
                variant={showSummary ? "outlined" : "contained"}
                onClick={() => setShowSummary((v) => !v)}
                startIcon={<AutoAwesomeIcon />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                }}
                disabled={!news?.ai_summary?.trim()}
              >
                {showSummary ? "Hide AI summary" : "Show AI summary"}
              </Button>
            </Stack>

            <Box
              sx={(theme) => ({
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                p: 2,
                maxHeight: { xs: 380, md: 460 },
                overflow: "auto",
                backgroundColor: alpha(theme.palette.background.default, 0.55),
              })}
            >
              {paragraphs.length > 0 ? (
                <Box sx={{ display: "grid", gap: 1.5 }}>
                  {paragraphs.map((p, idx) => (
                    <Typography
                      key={idx}
                      variant="body2"
                      sx={{
                        lineHeight: 1.7,
                        fontWeight: 400,
                        color: "text.primary",
                      }}
                    >
                      {p}
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No content available.
                </Typography>
              )}
            </Box>

            {/* Actions under article */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ mt: 1.5 }}
              justifyContent="flex-end"
            >
              {news?.source_url && (
                <Button
                  variant="outlined"
                  onClick={() =>
                    window.open(
                      news.source_url!,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  endIcon={<OpenInNewIcon />}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: "none",
                  }}
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
          </Box>

          {/* RIGHT: AI Summary (appears “instantly” on demand) */}
          <Collapse in={showSummary} orientation="vertical" timeout={180}>
            <Box
              sx={(theme) => ({
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.info.main, 0.25)}`,
                backgroundColor:
                  theme.palette.mode === "light"
                    ? alpha(theme.palette.info.main, 0.05)
                    : alpha(theme.palette.info.main, 0.14),
                p: 2,
                position: "sticky",
                top: 8,
              })}
            >
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: 0.8,
                  fontWeight: 600,
                  color: "text.secondary",
                }}
              >
                AI summary
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.75,
                  whiteSpace: "pre-line",
                  lineHeight: 1.6,
                  fontWeight: 400,
                }}
              >
                {news?.ai_summary?.trim()
                  ? news.ai_summary.trim()
                  : "No AI summary available."}
              </Typography>
            </Box>
          </Collapse>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default NewsDetailDialog;
