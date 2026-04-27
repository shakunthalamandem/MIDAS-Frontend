import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Chip,
  Divider,
  useMediaQuery,
  useTheme,
  Tooltip,
  Stack,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import dayjs from "dayjs";
import {
  fetchOpenClawConversations,
  resumeOpenClawChat,
} from "./openclawApi";
import type { OpenClawConversationSummary } from "./openclawTypes";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called when the user clicks an archived chat to preview it in the main pane. */
  onSelect: (salt: string) => void;
  /** Called after Resume succeeds so the page can reload the current thread. */
  onResumed: () => void;
  currentSalt: string;
}

function formatWhen(iso: string | null): string {
  if (!iso) return "";
  const d = dayjs(iso);
  const today = dayjs().startOf("day");
  const that = d.startOf("day");
  const diff = today.diff(that, "day");
  if (diff === 0) return `Today · ${d.format("HH:mm")}`;
  if (diff === 1) return `Yesterday · ${d.format("HH:mm")}`;
  if (diff < 7) return d.format("dddd · HH:mm");
  if (d.year() === dayjs().year()) return d.format("MMM D · HH:mm");
  return d.format("MMM D, YYYY");
}

const OpenClawHistoryDrawer: React.FC<Props> = ({
  open,
  onClose,
  onSelect,
  onResumed,
  currentSalt,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<OpenClawConversationSummary[]>([]);
  const [busySalt, setBusySalt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOpenClawConversations();
      setConversations(data.conversations || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleResume = async (salt: string) => {
    setBusySalt(salt);
    try {
      await resumeOpenClawChat(salt);
      onResumed();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to resume.");
    } finally {
      setBusySalt(null);
    }
  };

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? "100%" : 380,
          height: isMobile ? "85vh" : "100%",
          borderTopLeftRadius: isMobile ? 16 : 0,
          borderTopRightRadius: isMobile ? 16 : 0,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#fafbff",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          backgroundColor: "#1e3a8a",
          color: "#f8fafc",
          flexShrink: 0,
        }}
      >
        <HistoryRoundedIcon fontSize="small" />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            Conversation history
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            {conversations.length
              ? `${conversations.length} thread${conversations.length === 1 ? "" : "s"}`
              : "Your past MONA chats"}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#f8fafc" }}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      {/* List */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        )}

        {!loading && !error && conversations.length === 0 && (
          <Box sx={{ textAlign: "center", p: 4, color: "text.secondary" }}>
            <ForumRoundedIcon sx={{ fontSize: 44, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">No past conversations yet.</Typography>
            <Typography variant="caption">
              Start chatting — your threads will appear here.
            </Typography>
          </Box>
        )}

        {!loading && !error && conversations.length > 0 && (
          <List disablePadding>
            {conversations.map((c, idx) => {
              const isCurrent = c.session_salt === currentSalt;
              return (
                <React.Fragment key={c.session_salt || `empty-${idx}`}>
                  {idx > 0 && <Divider component="li" />}
                  <ListItemButton
                    onClick={() => onSelect(c.session_salt)}
                    sx={{
                      alignItems: "flex-start",
                      py: 1.25,
                      px: 2,
                      "&:hover": { bgcolor: "rgba(30, 58, 138, 0.04)" },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            mb: 0.25,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              flex: 1,
                              minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {c.preview}
                          </Typography>
                          {isCurrent && (
                            <Chip
                              size="small"
                              label="Current"
                              sx={{
                                height: 18,
                                fontSize: 9.5,
                                fontWeight: 700,
                                bgcolor: "#dcfce7",
                                color: "#166534",
                                "& .MuiChip-label": { px: 0.75 },
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          component="span"
                          sx={{ mt: 0.25 }}
                        >
                          <Typography variant="caption" color="text.secondary" component="span">
                            {formatWhen(c.last_at)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" component="span">
                            ·
                          </Typography>
                          <Typography variant="caption" color="text.secondary" component="span">
                            {c.message_count} msg{c.message_count === 1 ? "" : "s"}
                          </Typography>
                          {!isCurrent && (
                            <>
                              <Box sx={{ flex: 1 }} component="span" />
                              <Tooltip title="Continue this conversation">
                                <Box
                                  component="span"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleResume(c.session_salt);
                                  }}
                                  sx={{
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 999,
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    color: "#1e3a8a",
                                    border: "1px solid #1e3a8a",
                                    cursor: busySalt === c.session_salt ? "wait" : "pointer",
                                    opacity: busySalt === c.session_salt ? 0.5 : 1,
                                    "&:hover": { bgcolor: "rgba(30, 58, 138, 0.06)" },
                                  }}
                                >
                                  {busySalt === c.session_salt ? "…" : "Resume"}
                                </Box>
                              </Tooltip>
                            </>
                          )}
                        </Stack>
                      }
                      slotProps={{
                        secondary: { component: "div" },
                      }}
                    />
                  </ListItemButton>
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default OpenClawHistoryDrawer;
