import React from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

type NewsItem = {
  id: string;
  title: string;
  source?: string;
  publishedAt?: string;
  url?: string;
};

interface DealNewsPanelProps {
  ticker?: string | null;
  // Optional: allow parent to pass items directly if you already have data upstream
  items?: NewsItem[];
  loading?: boolean;
  error?: string | null;
}

const DealNewsPanel: React.FC<DealNewsPanelProps> = ({
  ticker,
  items,
  loading = false,
  error = null,
}) => {
  const hasTicker = Boolean(ticker && String(ticker).trim().length > 0);

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
        overflow: "hidden",
        height: "100%",
      })}
    >
      <Box
        sx={(theme) => ({
          px: 1.5,
          py: 1,
          backgroundColor: alpha(theme.palette.info.main, 0.06),
          borderBottom: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Typography
          variant="subtitle2"
          sx={{
            textTransform: "uppercase",
            letterSpacing: 0.7,
            fontSize: 11,
            fontWeight: 700,
            color: "text.secondary",
          }}
        >
          News
        </Typography>

        <Typography variant="body2" sx={{ mt: 0.25, fontWeight: 700 }}>
          {hasTicker ? ticker : "—"}
        </Typography>
      </Box>

      <Box sx={{ p: 1.25 }}>
        {!hasTicker ? (
          <Typography variant="body2" color="text.secondary">
            Select a deal with a ticker to view related news.
          </Typography>
        ) : error ? (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        ) : loading ? (
          <Box sx={{ display: "grid", gap: 1 }}>
            <Skeleton variant="rounded" height={54} />
            <Skeleton variant="rounded" height={54} />
            <Skeleton variant="rounded" height={54} />
            <Skeleton variant="rounded" height={54} />
          </Box>
        ) : items && items.length > 0 ? (
          <List disablePadding sx={{ display: "grid", gap: 0.75 }}>
            {items.map((n, idx) => (
              <React.Fragment key={n.id}>
                <ListItemButton
                  dense
                  sx={{
                    borderRadius: 1.25,
                    border: (theme) =>
                      `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  }}
                  onClick={() => {
                    if (n.url) window.open(n.url, "_blank", "noopener,noreferrer");
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {n.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {n.source ? n.source : "Source"}{" "}
                        {n.publishedAt ? `• ${n.publishedAt}` : ""}
                      </Typography>
                    }
                  />
                </ListItemButton>

                {idx !== items.length - 1 && <Divider sx={{ opacity: 0.35 }} />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No news found for {ticker}.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default DealNewsPanel;
