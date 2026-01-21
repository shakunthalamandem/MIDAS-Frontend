import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Chip,
  Stack,
  Button,
  Divider,
  Skeleton,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ArticleIcon from "@mui/icons-material/Article";
import SearchIcon from "@mui/icons-material/Search";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import StarsRoundedIcon from "@mui/icons-material/StarsRounded";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "react-router-dom";

interface NewsArticle {
  id: number;
  title: string;
  ticker: string;
  date: string; // "YYYY-MM-DD"
  gmt_time?: string; // "HH:MM:SS"
  ai_summary: string;
  sentiment: string;
  source_url: string;

  polarity?: number;
  positive_score?: number;
  neutral_score?: number;
  negative_score?: number;
}

type StockTickerNewsProps = {
  ticker?: string | null;
};

const normalizeTicker = (t?: string | null) =>
  typeof t === "string" && t.trim() ? t.trim().toUpperCase() : "";

const sentimentTone = (
  sentiment?: string
): "success" | "warning" | "error" | "default" => {
  const s = (sentiment || "").toLowerCase();
  if (s.includes("positive")) return "success";
  if (s.includes("negative")) return "error";
  if (s.includes("neutral")) return "warning";
  return "default";
};

const formatStamp = (date?: string, gmt?: string) => {
  if (!date && !gmt) return "—";
  if (date && gmt) return `${date} • ${gmt} GMT`;
  if (date) return date;
  return `${gmt} GMT`;
};

/** Reduce markdown whitespace (this is the main reason your UI looks "empty") */
const mdComponents = {
  p: ({ children }: any) => (
    <Typography
      variant="body2"
      sx={{ m: 0, lineHeight: 1.65, color: "text.primary" }}
    >
      {children}
    </Typography>
  ),
  ul: ({ children }: any) => (
    <Box component="ul" sx={{ m: 0, pl: 2.2, display: "grid", gap: 0.5 }}>
      {children}
    </Box>
  ),
  ol: ({ children }: any) => (
    <Box component="ol" sx={{ m: 0, pl: 2.2, display: "grid", gap: 0.5 }}>
      {children}
    </Box>
  ),
  li: ({ children }: any) => (
    <Box component="li" sx={{ m: 0, "&::marker": { color: "text.secondary" } }}>
      <Typography
        variant="body2"
        sx={{ m: 0, lineHeight: 1.6, color: "text.primary" }}
      >
        {children}
      </Typography>
    </Box>
  ),
};

const StockTickerNews: React.FC<StockTickerNewsProps> = ({ ticker }) => {
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const [searchParams] = useSearchParams();
  const queryTicker = searchParams.get("ticker");
  const initialTicker = normalizeTicker(ticker) || normalizeTicker(queryTicker);

  const [allNews, setAllNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tickerFilter, setTickerFilter] = useState(initialTicker);
  const [sentimentFilter, setSentimentFilter] = useState<
    "All" | "Positive" | "Neutral" | "Negative"
  >("All");

  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError("");

      try {
        const body = initialTicker ? { ticker: initialTicker } : {};

        const response = await fetch(`${API_BASE_URL}/api/fetch_news/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(data?.error || "Failed to fetch news");

        const newsData: NewsArticle[] =
          data?.portfolio_data?.news_data || data?.news_data || [];

        setAllNews(newsData);

        // auto select first item for better UX
        setSelectedId(newsData?.[0]?.id ?? null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL, token, initialTicker]);

  const filtered = useMemo(() => {
    const t = normalizeTicker(tickerFilter);
    return allNews.filter((n) => {
      const tickerOk = !t || normalizeTicker(n.ticker).includes(t);
      const sentimentOk =
        sentimentFilter === "All"
          ? true
          : (n.sentiment || "") === sentimentFilter;
      return tickerOk && sentimentOk;
    });
  }, [allNews, tickerFilter, sentimentFilter]);

  const selected = useMemo(
    () => filtered.find((n) => n.id === selectedId) || filtered[0] || null,
    [filtered, selectedId]
  );

  // keep selection valid when filters change
  useEffect(() => {
    if (!selected) setSelectedId(filtered?.[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.length]);

  return (
    <Container maxWidth="xl" sx={{ py: 2.5 }}>
      {/* Top header */}
      <Paper
        elevation={0}
        sx={(theme) => ({
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
          overflow: "hidden",
          mb: 2,
          background:
            theme.palette.mode === "light"
              ? `linear-gradient(145deg, ${alpha(theme.palette.info.main, 0.06)}, ${theme.palette.background.paper})`
              : theme.palette.background.paper,
        })}
      >
        <Box
          sx={(theme) => ({
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            background:
              theme.palette.mode === "light"
                ? `linear-gradient(180deg, ${alpha(theme.palette.info.main, 0.08)}, ${alpha(
                    theme.palette.background.paper,
                    0.9
                  )})`
                : alpha(theme.palette.info.main, 0.1),
          })}
        >
          {/* LEFT: Title + context */}
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={(theme) => ({
                width: 36,
                height: 36,
                borderRadius: 2.25,
                display: "grid",
                placeItems: "center",
                border: `1px solid ${alpha(theme.palette.info.main, 0.25)}`,
                backgroundColor:
                  theme.palette.mode === "light"
                    ? alpha(theme.palette.info.main, 0.1)
                    : alpha(theme.palette.info.main, 0.18),
              })}
            >
              <ArticleIcon fontSize="small" />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ minWidth: 0 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    lineHeight: 1.15,
                    letterSpacing: 0.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  News
                </Typography>

                {initialTicker ? (
                  <Chip
                    label={`${initialTicker}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 22,
                      borderRadius: 2,
                      fontWeight: 600,
                      bgcolor: (theme) =>
                        theme.palette.mode === "light"
                          ? alpha(theme.palette.info.main, 0.05)
                          : "transparent",
                    }}
                  />
                ) : (
                  <Chip
                    label="All tickers"
                    size="small"
                    variant="outlined"
                    sx={{ height: 22, borderRadius: 2, fontWeight: 600 }}
                  />
                )}
              </Stack>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.2,
                  display: "block",
                  mt: 0.2,
                }}
              >
                AI-curated summaries • fast scan • open source to verify
              </Typography>
            </Box>
          </Stack>

          {/* RIGHT: Status + actions */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              icon={<StarsRoundedIcon fontSize="small" />}
              label={`${filtered.length} headlines`}
              size="small"
              variant="outlined"
              sx={{
                height: 26,
                borderRadius: 2,
                fontWeight: 600,
                bgcolor: (theme) =>
                  theme.palette.mode === "light"
                    ? alpha(theme.palette.info.main, 0.06)
                    : "transparent",
              }}
            />
          </Stack>
        </Box>

        <Box
          sx={{
            p: 2,
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            value={tickerFilter}
            onChange={(e) => setTickerFilter(e.target.value)}
            placeholder="Filter ticker (e.g., AAPL)"
            size="small"
            sx={{ minWidth: 260, flex: 1 }}
            InputProps={{
              startAdornment: (
                <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                  <SearchIcon fontSize="small" />
                </Box>
              ),
            }}
          />

          <ToggleButtonGroup
            size="small"
            value={sentimentFilter}
            exclusive
            onChange={(_, v) => v && setSentimentFilter(v)}
            sx={{ borderRadius: 2 }}
          >
            <ToggleButton
              value="All"
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              All
            </ToggleButton>
            <ToggleButton
              value="Positive"
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Positive
            </ToggleButton>
            <ToggleButton
              value="Neutral"
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Neutral
            </ToggleButton>
            <ToggleButton
              value="Negative"
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Negative
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* Loading / Error */}
      {loading && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.6fr" },
            gap: 2,
          }}
        >
          <Paper
            elevation={0}
            sx={(t) => ({
              borderRadius: 3,
              border: `1px solid ${alpha(t.palette.divider, 0.9)}`,
              p: 2,
            })}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Box key={i} sx={{ mb: 1.25 }}>
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="60%" />
              </Box>
            ))}
          </Paper>
          <Paper
            elevation={0}
            sx={(t) => ({
              borderRadius: 3,
              border: `1px solid ${alpha(t.palette.divider, 0.9)}`,
              p: 2,
            })}
          >
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="rounded" height={180} sx={{ mt: 1.5 }} />
          </Paper>
        </Box>
      )}

      {!loading && error && (
        <Paper
          elevation={0}
          sx={(theme) => ({
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.error.main, 0.35)}`,
            backgroundColor: alpha(theme.palette.error.main, 0.06),
            p: 2,
          })}
        >
          <Typography color="error" sx={{ fontWeight: 600 }}>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
        </Paper>
      )}

      {/* Main layout */}
      {!loading && !error && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.6fr" },
            gap: 2,
            alignItems: "start",
          }}
        >
          {/* LEFT: Compact feed */}
          <Paper
            elevation={0}
            sx={(theme) => ({
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
              overflow: "hidden",
            })}
          >
            <Box
              sx={{
                px: 2,
                py: 1.25,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "text.secondary" }}
              >
                Headlines ({filtered.length})
              </Typography>
            </Box>
            <Divider />

            <Box
              sx={{
                maxHeight: { md: "calc(100vh - 240px)" },
                overflow: "auto",
              }}
            >
              {filtered.length === 0 ? (
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 600 }}>
                    No matching news
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Try a different ticker or sentiment filter.
                  </Typography>
                </Box>
              ) : (
                filtered.map((n) => {
                  const isActive = n.id === (selected?.id ?? null);
                  const tone = sentimentTone(n.sentiment);

                  return (
                    <Box
                      key={n.id}
                      onClick={() => setSelectedId(n.id)}
                      sx={(theme) => ({
                        px: 2,
                        py: 1.25,
                        cursor: "pointer",
                        borderLeft: `3px solid ${
                          isActive ? theme.palette.info.main : "transparent"
                        }`,
                        backgroundColor: isActive
                          ? alpha(theme.palette.info.main, 0.06)
                          : "transparent",
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.info.main, 0.04),
                        },
                      })}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="flex-start"
                        justifyContent="space-between"
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            lineHeight: 1.35,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            pr: 1,
                          }}
                        >
                          {n.title}
                        </Typography>

                        <Chip
                          label={n.sentiment || "—"}
                          color={tone === "default" ? undefined : tone}
                          variant={tone === "default" ? "outlined" : "filled"}
                          size="small"
                          sx={{ fontWeight: 600, borderRadius: 2 }}
                        />
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mt: 0.75 }}
                      >
                        <Chip
                          label={
                            normalizeTicker(n.ticker)
                              ? `${normalizeTicker(n.ticker)}`
                              : "—"
                          }
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600, borderRadius: 2, height: 22 }}
                        />
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <AccessTimeIcon
                            sx={{ fontSize: 14, color: "text.secondary" }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 600 }}
                          >
                            {formatStamp(n.date, n.gmt_time)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })
              )}
            </Box>
          </Paper>

          {/* RIGHT: Detail panel */}
          <Paper
            elevation={0}
            sx={(theme) => ({
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
              overflow: "hidden",
              position: { md: "sticky" },
              top: { md: 16 },
            })}
          >
            <Box
              sx={(theme) => ({
                px: 2,
                py: 1.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: alpha(theme.palette.background.default, 0.45),
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 2,
              })}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    lineHeight: 1.25,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {selected?.title || "Select a headline"}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: 0.75, flexWrap: "wrap" }}
                >
                  <Chip
                    label={
                      selected?.ticker
                        ? `${normalizeTicker(selected.ticker)}`
                        : "—"
                    }
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    {formatStamp(selected?.date, selected?.gmt_time)}
                  </Typography>
                </Stack>
              </Box>

              {selected?.source_url && (
                <IconButton
                  size="small"
                  onClick={() =>
                    window.open(
                      selected.source_url,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  sx={(theme) => ({
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                  })}
                  aria-label="Open source"
                  title="Open source"
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Box sx={{ p: 2 }}>
              <Box
                sx={(theme) => ({
                  borderRadius: 2.5,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.28)}`,
                  background:
                    theme.palette.mode === "light"
                      ? `linear-gradient(180deg, ${alpha(theme.palette.info.main, 0.08)}, ${theme.palette.background.paper})`
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
                      0.2
                    )}, transparent 46%)`,
                    pointerEvents: "none",
                  })}
                />

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
                      border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                      backgroundColor:
                        theme.palette.mode === "light"
                          ? alpha(theme.palette.info.main, 0.1)
                          : alpha(theme.palette.info.main, 0.18),
                    })}
                  >
                    <AutoAwesomeOutlinedIcon fontSize="small" />
                  </Box>

                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, letterSpacing: 0.25 }}
                  >
                    AI Generated Summary
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                </Stack>

                <Box sx={{ mt: 1.25, position: "relative" }}>
                  {selected?.ai_summary ? (
                    <ReactMarkdown components={mdComponents as any}>
                      {selected.ai_summary}
                    </ReactMarkdown>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ m: 0 }}
                    >
                      No summary available.
                    </Typography>
                  )}
                </Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1.5, display: "block", fontWeight: 600 }}
                >
                  Want the full article? Use{" "}
                  <Box
                    component="span"
                    sx={{ fontWeight: 600, color: "text.primary" }}
                  >
                    Open source
                  </Box>
                  .
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                justifyContent="flex-end"
                sx={{ mt: 2 }}
              >
                {selected?.source_url && (
                  <Button
                    variant="contained"
                    onClick={() =>
                      window.open(
                        selected.source_url,
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
              </Stack>
            </Box>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default StockTickerNews;
