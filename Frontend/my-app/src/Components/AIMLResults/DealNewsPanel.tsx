import React from "react";
import {
  Box,
  Paper,
  Typography,
  Skeleton,
  Button,
  Chip,
  IconButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useNavigate } from "react-router-dom";
import NewsDetailDialog, { ApiNewsItem } from "./NewsDetailDialog";

interface DealNewsPanelProps {
  ticker?: string | null;
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

const DealNewsPanel: React.FC<DealNewsPanelProps> = ({ ticker }) => {
  const navigate = useNavigate();

  const [items, setItems] = React.useState<ApiNewsItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<ApiNewsItem | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const normalizedTicker =
    typeof ticker === "string" && ticker.trim().length > 0
      ? ticker.trim().toUpperCase()
      : null;

  React.useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      if (!normalizedTicker) {
        setItems([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${apiUrl}/api/fetch_news/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ ticker: normalizedTicker }),
        });

        if (!res.ok) throw new Error(`Request failed (${res.status})`);

        const json = await res.json();

        const newsData: ApiNewsItem[] = Array.isArray(
          json?.portfolio_data?.news_data
        )
          ? json.portfolio_data.news_data
          : Array.isArray(json?.news_data)
            ? json.news_data
            : [];

        if (!isMounted) return;

        // ✅ show max 3 in the rail
        setItems(newsData.slice(0, 3));
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || "Failed to fetch news.");
        setItems([]);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, [normalizedTicker, apiUrl, token]);

  const goToNews = (t?: string | null) => {
    const tt = t || normalizedTicker;
    navigate(`/macro/news-summary/${tt ? `?ticker=${encodeURIComponent(tt)}` : ""}`);
  };

  const openModal = (news: ApiNewsItem) => {
    setSelected(news);
    setOpen(true);
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={(theme) => ({
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
          overflow: "hidden",
          height: "100%",
        })}
      >
        {/* Header */}
        <Box
          sx={(theme) => ({
            px: 1.5,
            py: 1,
            backgroundColor: alpha(theme.palette.info.main, 0.06),
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: "flex",
            alignItems: "center", // ✅ key fix
            justifyContent: "space-between",
          })}
        >
          <Typography
            variant="subtitle2"
            sx={{
              textTransform: "uppercase",
              letterSpacing: 0.7,
              fontSize: 11,
              fontWeight: 600,
              color: "#000000",
              lineHeight: 1, // ✅ visual alignment
            }}
          >
            Latest News for {normalizedTicker ?? "—"}
          </Typography>

          <Button
            size="small"
            variant="text"
            onClick={() => goToNews(normalizedTicker)}
            disabled={!normalizedTicker}
            sx={{
              minWidth: 0,
              px: 1,
              fontWeight: 600,
              lineHeight: 1, // optional but helps
            }}
            endIcon={<OpenInNewIcon fontSize="small" />}
          >
            View all
          </Button>
        </Box>

        {/* Body */}
        <Box sx={{ p: 1.25 }}>
          {!normalizedTicker ? (
            <Typography variant="body2" color="#000000">
              Select a deal with a ticker to view related news.
            </Typography>
          ) : error ? (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          ) : loading ? (
            <Box sx={{ display: "grid", gap: 1 }}>
              <Skeleton variant="rounded" height={84} />
              <Skeleton variant="rounded" height={84} />
              <Skeleton variant="rounded" height={84} />
            </Box>
          ) : items.length > 0 ? (
            <Box sx={{ display: "grid", gap: 1 }}>
              {items.map((n) => {
                const tone = sentimentTone(n.sentiment);
                const ts = formatTimestamp(n.date, n.gmt_time);

                return (
                  <Box
                    key={n.id}
                    sx={(theme) => ({
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                      p: 1.1,
                      background:
                        theme.palette.mode === "light"
                          ? `linear-gradient(180deg, ${alpha(
                              theme.palette.background.default,
                              0.7
                            )}, ${theme.palette.background.paper})`
                          : theme.palette.background.paper,
                      transition: "transform 120ms ease, box-shadow 120ms ease",
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: `0 10px 22px ${alpha(theme.palette.common.black, 0.08)}`,
                      },
                    })}
                  >
                    {/* top row: title + sentiment */}
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          lineHeight: 1,
                          flex: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                        title={n.title}
                      >
                        {n.title}
                      </Typography>

                      <Chip
                        label={n.sentiment || "—"}
                        size="small"
                        color={tone === "default" ? undefined : tone}
                        variant={tone === "default" ? "outlined" : "filled"}
                        sx={{
                          fontWeight: 600,
                          borderRadius: 2,
                          height: 22,
                        }}
                      />
                    </Box>

                    {/* timestamp */}
                    <Typography
                      variant="caption"
                      color="#000000"
                      sx={{ mt: 0.6, fontWeight: 600 }}
                    >
                      {ts}
                    </Typography>

                    {/* actions */}
                    <Box
                      sx={{
                        mt: 0.75,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => openModal(n)}
                        sx={{ px: 1, fontWeight: 600 }}
                        endIcon={<ChevronRightIcon />}
                      >
                        Show more
                      </Button>

                      <Box sx={{ flex: 1 }} />

                      {n.source_url && (
                        <IconButton
                          size="small"
                          onClick={() =>
                            window.open(
                              n.source_url!,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                          sx={(theme) => ({
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                          })}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Typography variant="body2" color="#000000">
              No news found for {normalizedTicker}.
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Modal */}
      <NewsDetailDialog
        open={open}
        news={selected}
        onClose={() => setOpen(false)}
        onGoToAllNews={(t) => goToNews(t || normalizedTicker)}
      />
    </>
  );
};

export default DealNewsPanel;
