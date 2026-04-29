import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BlockRenderer, { GatorBlock } from "../../GatorPostIpoAgent/BlockRenderer";

interface SavedRecord {
  id: number;
  ticker: string;
  company_name: string | null;
  headline: string | null;
  json_data: GatorBlock[];
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  records: SavedRecord[];
}

interface Props {
  ticker?: string;
}

const deriveMeta = (blocks: GatorBlock[] = []) => {
  let score: number | null = null;
  let sentiment = "";
  let horizon = "";
  for (const b of blocks) {
    if (b.type === "card" && typeof b.title === "string") {
      const t = b.title.toLowerCase();
      if (score === null && /score/.test(t)) {
        const m = b.title.match(/([-+]?\d+(?:\.\d+)?)/);
        if (m) score = parseFloat(m[1]);
        sentiment = (b.subtitle || "").trim();
      } else if (!horizon && /horizon/.test(t)) {
        horizon = `${b.title}${b.subtitle ? " · " + b.subtitle : ""}`;
      }
    }
  }
  return { score, sentiment, horizon };
};

const sentimentTone = (s: string) => {
  const v = (s || "").toLowerCase();
  if (/bullish|strong|positive|favorable/.test(v))
    return { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0" };
  if (/bearish|weak|negative|cautious/.test(v))
    return { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" };
  return { bg: "#f1f5f9", color: "#334155", border: "#e2e8f0" };
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const GatorPostIpoTickerTab: React.FC<Props> = ({ ticker }) => {
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/gator_post_ipo/list/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data: ApiResponse = await res.json();
      setRecords(data.records || []);
    } catch {
      setRecords([]);
      setError("Failed to load Gator Post-IPO data");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const tickerKey = (ticker || "").toUpperCase().split(" ")[0];

  const matched = useMemo(() => {
    if (!tickerKey) return null;
    return (
      records.find((r) => (r.ticker || "").toUpperCase().split(" ")[0] === tickerKey) || null
    );
  }, [records, tickerKey]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={32} sx={{ color: "#0f766e" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!matched) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          px: 3,
          bgcolor: "#f0fdfa",
          border: "1px dashed #99f6e4",
          borderRadius: 3,
        }}
      >
        <RocketLaunchOutlinedIcon sx={{ fontSize: 48, color: "#0f766e", mb: 1.5 }} />
        <Typography sx={{ fontWeight: 700, color: "#134e4a", fontSize: "1rem", mb: 0.5 }}>
          No Gator Post-IPO report yet for {ticker}
        </Typography>
        <Typography sx={{ color: "#475569", fontSize: "0.85rem", maxWidth: 460, mx: "auto" }}>
          A Day&nbsp;1–40 post-listing scorecard hasn't been generated for this ticker. Reports
          appear here automatically once published.
        </Typography>
      </Box>
    );
  }

  const meta = deriveMeta(matched.json_data || []);
  const tone = sentimentTone(meta.sentiment);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Header strip */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #ecfeff 0%, #f0fdfa 60%, #ffffff 100%)",
          border: "1px solid #99f6e4",
          borderRadius: 3,
          p: 2.5,
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          boxShadow: "0 8px 24px rgba(15, 118, 110, 0.06)",
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            bgcolor: "#0f766e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <TrendingUpIcon sx={{ color: "#fff", fontSize: 26 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#0f766e", letterSpacing: "0.08em" }}
          >
            GATOR POST-IPO · DAY 1–40
          </Typography>
          <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", mt: 0.2 }}>
            {matched.headline || matched.company_name || matched.ticker}
          </Typography>
          {matched.updated_at && (
            <Stack direction="row" alignItems="center" spacing={0.6} sx={{ mt: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 13, color: "#64748b" }} />
              <Typography sx={{ fontSize: "0.72rem", color: "#64748b" }}>
                Updated {formatTime(matched.updated_at)}
              </Typography>
            </Stack>
          )}
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {meta.score !== null && (
            <Chip
              label={`Score ${meta.score > 0 ? "+" : ""}${meta.score}`}
              sx={{
                fontWeight: 800,
                fontSize: "0.78rem",
                bgcolor: "#0f766e",
                color: "#fff",
                "& .MuiChip-label": { px: 1.4 },
              }}
            />
          )}
          {meta.sentiment && (
            <Chip
              label={meta.sentiment.toUpperCase()}
              sx={{
                fontWeight: 700,
                fontSize: "0.72rem",
                bgcolor: tone.bg,
                color: tone.color,
                border: `1px solid ${tone.border}`,
              }}
            />
          )}
          {meta.horizon && (
            <Chip
              label={meta.horizon}
              sx={{
                fontWeight: 600,
                fontSize: "0.72rem",
                bgcolor: "#fff",
                color: "#0f172a",
                border: "1px solid #e2e8f0",
              }}
            />
          )}
        </Stack>
      </Box>

      {/* Block renderer body */}
      <Box
        sx={{
          bgcolor: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          p: { xs: 1.5, md: 2.5 },
          boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
        }}
      >
        <BlockRenderer blocks={matched.json_data || []} />
      </Box>
    </Box>
  );
};

export default GatorPostIpoTickerTab;
