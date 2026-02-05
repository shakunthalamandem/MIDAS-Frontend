import { SectionCard } from "./SectionCard";
import { Box, Stack, Typography } from "@mui/material";

type SummaryPayload = {
  one_week?: string;
  one_month?: string;
};

const splitLines = (text?: string) =>
  (text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

export function MarketSentimentCard({
  one_week_sentiment,
  one_month_sentiment,
  sentiment_summary,
}: {
  one_week_sentiment: string;
  one_month_sentiment: string;
  sentiment_summary: string;
}) {
  const hasSummary = !!sentiment_summary?.trim();
  const parsedSummary: SummaryPayload | null = (() => {
    if (!sentiment_summary) return null;
    try {
      const parsed = JSON.parse(sentiment_summary);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        ("one_week" in parsed || "one_month" in parsed)
      ) {
        return parsed as SummaryPayload;
      }
    } catch {
      // ignore
    }
    return null;
  })();
  const sentimentStyle = (value: string) => {
    const normalized = value?.toLowerCase() || "";
    if (normalized.includes("bull")) {
      return { color: "#0f5132", borderColor: "#d1fae5", bg: "#dcfce7" };
    }
    if (normalized.includes("bear")) {
      return { color: "#991b1b", borderColor: "#fecdd3", bg: "#ffe4e6" };
    }
    if (normalized.includes("neutral") || normalized.includes("cautious")) {
      return { color: "#475569", borderColor: "#e2e8f0", bg: "#e2e8f0" };
    }
    return { color: "#0f172a", borderColor: "rgba(209, 213, 226, 0.9)", bg: "#ffffff" };
  };

  return (
    <SectionCard title="Market Sentiment">
      <Stack spacing={2}>
        {hasSummary && (
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            {(parsedSummary?.one_week || !parsedSummary) && (
              <Box
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  border: "1px solid rgba(209, 213, 226, 0.9)",
                  background: "#ffffff",
                  p: 2,
                  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1d2b5a" }}>
                    1-Week Narrative
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: sentimentStyle(one_week_sentiment).color,
                      background: sentimentStyle(one_week_sentiment).bg,
                      borderRadius: 1,
                      px: 0.75,
                      py: 0.25,
                      fontWeight: 700,
                    }}
                  >
                    {one_week_sentiment || "-"}
                  </Typography>
                </Stack>
                <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
                  {(parsedSummary?.one_week
                    ? splitLines(parsedSummary.one_week)
                    : splitLines(sentiment_summary)
                  ).map((line, idx) => (
                    <Typography
                      key={`week-li-${idx}`}
                      component="li"
                      variant="body2"
                      sx={{ color: "#141414", lineHeight: 1.6, mb: 0.5 }}
                    >
                      {line}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
            {(parsedSummary?.one_month || !parsedSummary) && (
              <Box
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  border: "1px solid rgba(209, 213, 226, 0.9)",
                  background: "#ffffff",
                  p: 2,
                  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1d2b5a" }}>
                    1-Month Narrative
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: sentimentStyle(one_month_sentiment).color,
                      background: sentimentStyle(one_month_sentiment).bg,
                      borderRadius: 1,
                      px: 0.75,
                      py: 0.25,
                      fontWeight: 700,
                    }}
                  >
                    {one_month_sentiment || "-"}
                  </Typography>
                </Stack>
                <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
                  {(parsedSummary?.one_month
                    ? splitLines(parsedSummary.one_month)
                    : splitLines(sentiment_summary)
                  ).map((line, idx) => (
                    <Typography
                      key={`month-li-${idx}`}
                      component="li"
                      variant="body2"
                      sx={{ color: "#141414", lineHeight: 1.6, mb: 0.5 }}
                    >
                      {line}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Stack>
        )}

        {/* <Box
          sx={{
            borderRadius: 2,
            // border: "1px solid rgba(207, 217, 240, 0.9)",
            // background: "#f8f9ff",
            p: { xs: 1, sm: 1.5 },
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1, sm: 2 }}
            sx={{
              width: "100%",
              maxWidth: 420,
              textAlign: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                flex: 1,
                minWidth: 160,
                borderRadius: 2,
                background: "#ffffff",
                border: "1px solid rgba(209, 213, 226, 0.9)",
                py: 2,
                px: 2.5,
              }}
            >
              <Typography variant="subtitle2" sx={{ color: "#1d2b5a", fontWeight: 600 }}>
                1-Week Sentiment
              </Typography>
              {(() => {
                const { color, bg, borderColor } = sentimentStyle(one_week_sentiment);
                return (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      fontWeight: 600,
                      color,
                      background: bg,
                      borderRadius: 1,
                      px: 1,
                      border: `1px solid ${borderColor}`,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {one_week_sentiment || "-"}
                  </Typography>
                );
              })()}
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: 160,
                borderRadius: 2,
                background: "#ffffff",
                border: "1px solid rgba(209, 213, 226, 0.9)",
                py: 2,
                px: 2.5,
              }}
            >
              <Typography variant="subtitle2" sx={{ color: "#1d2b5a", fontWeight: 600 }}>
                1-Month Sentiment
              </Typography>
              {(() => {
                const { color, bg, borderColor } = sentimentStyle(one_month_sentiment);
                return (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      fontWeight: 600,
                      color,
                      background: bg,
                      borderRadius: 1,
                      px: 1,
                      border: `1px solid ${borderColor}`,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {one_month_sentiment || "-"}
                  </Typography>
                );
              })()}
            </Box>
          </Stack>
        </Box> */}
      </Stack>
    </SectionCard>
  );
}
