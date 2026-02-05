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
  Card,
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

const formatConfidence = (item?: NewsArticle | null) => {
  if (!item) return null;
  const scores = [
    item.positive_score ?? 0,
    item.neutral_score ?? 0,
    item.negative_score ?? 0,
  ];
  const maxScore = Math.max(...scores);
  if (!maxScore || Number.isNaN(maxScore)) return null;
  return `${Math.round(maxScore * 100)}% Confidence Score`;
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
    <Box component="li" sx={{ m: 0, "&::marker": { color: "#000000" } }}>
      <Typography
        variant="body2"
        sx={{ m: 0, lineHeight: 1.6, color: "text.primary" }}
      >
        {children}
      </Typography>
    </Box>
  ),
};

const NewDashboardLifeCycleNews: React.FC<StockTickerNewsProps> = ({ ticker }) => {
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const [searchParams] = useSearchParams();
  const queryTicker = searchParams.get("ticker");
  const initialTicker = normalizeTicker(ticker) || normalizeTicker(queryTicker);

  const [allNews, setAllNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noNewsMessage, setNoNewsMessage] = useState("");

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
        setNoNewsMessage(
          data?.portfolio_data?.message ||
            (data?.portfolio_data?.status === 204 ? "No news available." : "")
        );

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

  const isNoNews =
    !loading && !error && allNews.length === 0 && !!noNewsMessage;

  const selected = useMemo(
    () => filtered.find((n) => n.id === selectedId) || filtered[0] || null,
    [filtered, selectedId]
  );

  const confidenceText = useMemo(
    () => formatConfidence(selected),
    [selected]
  );

  // keep selection valid when filters change
  useEffect(() => {
    if (!selected) setSelectedId(filtered?.[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.length]);

  return (
    <Container maxWidth="xl" sx={{ py: 2.5 }}>
      {/* Top header (no card) */}
      <Box sx={{ mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{ minWidth: 0, flex: 1 }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={(theme) => ({
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
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
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, lineHeight: 1.1 }}
                  >
                    Financial News Intelligence
                  </Typography>
                  {initialTicker ? (
                    <Chip
                      label={`${initialTicker}`}
                      size="small"
                      variant="outlined"
                      sx={{ height: 22, borderRadius: 2, fontWeight: 600 }}
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
                  variant="body2"
                  color="#000000"
                  sx={{ fontWeight: 600, mt: 0.5 }}
                >
                  AI-powered market insights and real-time analysis
                </Typography>
              </Box>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {/* Search bar temporarily disabled */}
            {/*
              <TextField
                value={tickerFilter}
                onChange={(e) => setTickerFilter(e.target.value)}
                placeholder="Search ticker (e.g., AAPL)"
                size="small"
                sx={{ minWidth: 280 }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                      <SearchIcon fontSize="small" />
                    </Box>
                  ),
                }}
              />
            */}
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
          </Stack>
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ xs: "flex-start", md: "center" }}
          sx={{ mt: 1.25 }}
        >
          {/* <Chip
            icon={<StarsRoundedIcon fontSize="small" />}
            label={`${filtered.length} headlines`}
            size="small"
            variant="outlined"
            sx={{ height: 28, borderRadius: 2, fontWeight: 600 }}
          /> */}
        </Stack>
      </Box>

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
          <Typography variant="body2" color="#000000">
            {error}
          </Typography>
        </Paper>
      )}

      {/* No news state */}
      {isNoNews && (
        <Paper
          elevation={0}
          sx={(theme) => ({
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
            backgroundColor: alpha(theme.palette.info.main, 0.04),
            p: 2,
          })}
        >
          <Typography sx={{ fontWeight: 600 }}>
            {noNewsMessage}
          </Typography>
          <Typography variant="body2" color="#000000" sx={{ mt: 0.5 }}>
            Check back later for new updates.
          </Typography>
        </Paper>
      )}

      {/* Main layout */}
      {!loading && !error && !isNoNews && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.6fr" },
            gap: 2,
            alignItems: "start",
          }}
        >
          {/* LEFT: Compact feed */}
          <Card
            elevation={0}
            sx={(theme) => ({
              borderRadius: 3,
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
                sx={{ fontWeight: 600, color: "#000000" }}
              >
                Headlines ({filtered.length})
              </Typography>
            </Box>
            {/* <Divider /> */}

            <Box
              sx={{
                maxHeight: { md: "calc(100vh - 240px)" },
                overflow: "auto",
                p: 1,
              }}
            >
              {filtered.length === 0 ? (
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 600 }}>
                    No matching news
                  </Typography>
                  <Typography
                    variant="body2"
                    color="#000000"
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
                        px: 1.75,
                        py: 1.5,
                        mb:2,
                        cursor: "pointer",
                        borderRadius: 2,
                        border:`${
                          isActive
                            ? "#e60fd41f"
                            :" #0b2fcc1f"
                        }`,
                        boxShadow: isActive
                          ? `0 0 0 2px ${alpha(
                              theme.palette.info.main,
                              0.15
                            )}`
                        :" #0b2fcc1f",
                        backgroundColor: isActive
                          ? "#4f7dcd1f"
                          : theme.palette.background.paper,
                        "&:hover": {
                          backgroundColor: "#1ed8df1f",
                        },
                        "& + &": { mt: 1 },
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
                            sx={{ fontSize: 14, color: "#000000" }}
                          />
                          <Typography
                            variant="caption"
                            color="#000000"
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
          </Card>

          {/* RIGHT: Detail panel */}
          <Card
            elevation={0}
            sx={(theme) => ({
              borderRadius: 3,
              overflow: "hidden",
              position: { md: "sticky" },
              top: { md: 16 },
              // backgroundColor: alpha(theme.palette.info.main, 0.08),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            })}
          >
            <Box
              sx={(theme) => ({
                px: 2,
                py: 1.5,
                // backgroundColor: alpha(theme.palette.background.default, 0.45),
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 2,
              })}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.3,
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
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <AccessTimeIcon
                      sx={{ fontSize: 14, color: "#000000" }}
                    />
                    <Typography
                      variant="caption"
                      color="#000000"
                      sx={{ fontWeight: 600 }}
                    >
                      {formatStamp(selected?.date, selected?.gmt_time)}
                    </Typography>
                  </Stack>
                  {selected?.sentiment && (
                    <Chip
                      label={selected.sentiment}
                      size="small"
                      color={
                        sentimentTone(selected.sentiment) === "default"
                          ? undefined
                          : sentimentTone(selected.sentiment)
                      }
                      variant={
                        sentimentTone(selected.sentiment) === "default"
                          ? "outlined"
                          : "filled"
                      }
                      sx={{ fontWeight: 600, borderRadius: 2 }}
                    />
                  )}
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

            <Divider />

            <Box sx={{ p: 2 }}>
              <Box
                sx={(theme) => ({
                  borderRadius: 2.5,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.28)}`,
                  background:
                    theme.palette.mode === "light"
                      ? "#ffff"
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
                      width: 34,
                      height: 34,
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

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, letterSpacing: 0.2 }}
                    >
                      AI Generated Summary
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <StarsRoundedIcon
                        sx={{ fontSize: 16, color: "#000000" }}
                      />
                      <Typography
                        variant="caption"
                        color="#000000"
                        sx={{ fontWeight: 600 }}
                      >
                        {confidenceText || "Confidence score unavailable"}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                <Box sx={{ mt: 1.25, position: "relative" }}>
                  {selected?.ai_summary ? (
                    <ReactMarkdown components={mdComponents as any}>
                      {selected.ai_summary}
                    </ReactMarkdown>
                  ) : (
                    <Typography
                      variant="body2"
                      color="#000000"
                      sx={{ m: 0 }}
                    >
                      No summary available.
                    </Typography>
                  )}
                </Box>

                <Typography
                  variant="caption"
                  color="#000000"
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
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default NewDashboardLifeCycleNews;
