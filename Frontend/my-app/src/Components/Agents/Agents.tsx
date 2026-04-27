import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";

import AgentCard from "./AgentCards/AgentCard";
import CreateAgentDialog from "./CreateAgentDialog";
import EditAgentDialog from "./EditAgentDialog";
import { AIAgent } from "./types";
import { fetchAgents, toggleEmailPreference, deleteAgent, fetchAgentTickerList } from "./agentService";

const POLL_INTERVAL_MS = 15_000;

interface TickerItem {
  ticker: string;
  pricing_date: string | null;
  region: string;
  deal_type: string;
  unique_deal_id: string;
  issuer_name: string;
  sector: string;
}

const Agents: React.FC = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("is_staff") === "true";

  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [adminGateOpen, setAdminGateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState<AIAgent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<AIAgent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [tickerList, setTickerList] = useState<TickerItem[]>([]);
  const [tickerLoading, setTickerLoading] = useState(false);

  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const loadAgents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAgents();
      // Hide IPO Ranking Agent; merge Portfolio CIO Agent + Risk Agent into one
      let cioAgent: AIAgent | undefined;
      const transformed: AIAgent[] = [];
      for (const agent of data) {
        if (agent.name === "IPO Ranking Agent") continue;
        if (agent.name === "Portfolio CIO Agent") { cioAgent = agent; continue; }
        if (agent.name === "Risk Agent") continue;
        transformed.push(agent);
      }
      if (cioAgent) {
        transformed.unshift({
          ...cioAgent,
          name: "Portfolio Risk Agent",
          description: "AI-powered portfolio oversight combining risk and performance analysis. Monitors exposures, P&L attribution, and risk triggers to support capital allocation decisions.",
        });
      }
      setAgents(transformed);
    } catch (err) {
      console.error("Failed to load agents:", err);
      setSnackbar({ open: true, message: "Failed to load agents", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAgents(); }, [loadAgents]);

  useEffect(() => {
    const loadTickers = async () => {
      try {
        setTickerLoading(true);
        const data = await fetchAgentTickerList();
        setTickerList(data.data || []);
      } catch (err) {
        console.error("Failed to load ticker list:", err);
      } finally {
        setTickerLoading(false);
      }
    };
    loadTickers();
  }, []);

  useEffect(() => {
    const hasInProgress = agents.some(
      (a) => a.output_status === "pending" || a.output_status === "running"
    );
    if (hasInProgress) {
      pollRef.current = setInterval(() => {
        fetchAgents().then(setAgents).catch(() => {});
      }, POLL_INTERVAL_MS);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [agents]);

  const handleEmailToggle = async (agent: AIAgent, enabled: boolean) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === agent.id ? { ...a, email_enabled: enabled } : a))
    );
    try {
      await toggleEmailPreference(agent.id, enabled);
      setSnackbar({
        open: true,
        message: enabled
          ? `Email notifications enabled for ${agent.name}`
          : `Email notifications disabled for ${agent.name}`,
        severity: "success",
      });
    } catch (err: any) {
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, email_enabled: !enabled } : a))
      );
      setSnackbar({
        open: true,
        message: err.message || "Failed to update email preference",
        severity: "error",
      });
    }
  };

  const handleDeleteRequest = (agent: AIAgent) => {
    setAgentToDelete(agent);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!agentToDelete) return;
    setDeleting(true);
    try {
      await deleteAgent(agentToDelete.id);
      setSnackbar({ open: true, message: `Agent "${agentToDelete.name}" deleted`, severity: "success" });
      setDeleteDialogOpen(false);
      setAgentToDelete(null);
      loadAgents();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Failed to delete agent", severity: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const totalAgents = agents.length;
  const activeAgents = agents.filter(
    (a) => a.output_status === "completed" || a.agent_type === "system"
  ).length;
  const workingAgents = agents.filter(
    (a) => a.output_status === "pending" || a.output_status === "running"
  ).length;

  return (
    <Box sx={{ bgcolor: "#e8eaf0", minHeight: "100vh" }}>
      {/* ── Header ── */}
      <Box
        sx={{
          bgcolor: "#fff",
          borderBottom: "1px solid #c7d2fe",
          px: { xs: 2, md: 5 },
          pt: { xs: 3, md: 4 },
          pb: { xs: 4, md: 5 },
        }}
      >
        <Box sx={{ maxWidth: 1320, mx: "auto" }}>
          {/* Title row */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 3,
                  bgcolor: "#4f46e5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SmartToyOutlinedIcon sx={{ color: "#fff", fontSize: 26 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: "1.4rem", md: "1.65rem" },
                    fontWeight: 800,
                    color: "#111827",
                    letterSpacing: "-0.025em",
                    lineHeight: 1.2,
                  }}
                >
                  AI Agents
                </Typography>
                <Typography sx={{ color: "#374151", fontSize: "0.85rem", mt: 0.3 }}>
                  Autonomous financial agents analyzing markets around the clock.
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5}>
              {/* Ticker Search Bar */}
              <Autocomplete
                options={tickerList}
                getOptionLabel={(option) =>
                  `${option.ticker} | ${option.pricing_date || "N/A"} | ${option.deal_type}`
                }
                loading={tickerLoading}
                disabled={tickerLoading}
                onChange={(event, value) => {
                  if (value) {
                    navigate(`/agents/ticker/${value.ticker}`, {
                      state: { dealData: value }
                    });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search ticker..."
                    variant="outlined"
                    size="small"
                    sx={{
                      width: 280,
                      "& .MuiOutlinedInput-root": {
                        fontSize: "0.9rem",
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const formatDate = (dateString: string | null) => {
                    if (!dateString) return "N/A";
                    const date = new Date(dateString);
                    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
                  };

                  return (
                    <Box
                      component="li"
                      {...props}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.4,
                        py: 1.2,
                        px: 2,
                        borderBottom: "1px solid #e0e0f7",
                        "&:last-child": { borderBottom: "none" },
                        "&:hover": {
                          backgroundColor: "#f8f9ff",
                        },
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "0.95rem" }}>
                        {option.ticker} <span style={{ fontWeight: 500, color: "#0b4ca8" }}>({formatDate(option.pricing_date)})</span>
                      </Typography>
                      <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#373446" }}>
                        {option.issuer_name || "N/A"}
                      </Typography>
                    </Box>
                  );
                }}
                noOptionsText="No tickers found"
                sx={{
                  "& .MuiAutocomplete-paper": {
                    borderRadius: 2,
                    border: "1px solid #c7d2fe",
                  },
                }}
              />

              <Button
                variant="contained"
                startIcon={isAdmin ? <AddIcon /> : <LockOutlinedIcon />}
                onClick={() =>
                  isAdmin ? setCreateOpen(true) : setAdminGateOpen(true)
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  px: 3,
                  py: 1.1,
                  borderRadius: 2.5,
                  bgcolor: isAdmin ? "#4f46e5" : "#475569",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: isAdmin ? "#4338ca" : "#334155",
                    boxShadow: "0 4px 12px rgba(79,70,229,0.25)",
                  },
                  flexShrink: 0,
                }}
              >
                Create Agent
              </Button>
            </Stack>
          </Stack>

          {/* Stat pills */}
          <Stack direction="row" spacing={2} mt={3.5} flexWrap="wrap" alignItems="flex-end">
            {/* Total */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                bgcolor: "#f0f0ff",
                border: "1px solid #e0e0f7",
                borderRadius: 3,
                px: 2.5,
                py: 1.5,
                minWidth: 170,
              }}
            >
              <WidgetsOutlinedIcon sx={{ color: "#4f46e5", fontSize: 22 }} />
              <Box>
                <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                  {totalAgents}
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#312e81", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Total Agents
                </Typography>
              </Box>
            </Box>

            {/* Ready */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                bgcolor: "#ecfdf5",
                border: "1px solid #d1fae5",
                borderRadius: 3,
                px: 2.5,
                py: 1.5,
                minWidth: 170,
              }}
            >
              <CheckCircleIcon sx={{ color: "#059669", fontSize: 22 }} />
              <Box>
                <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                  {activeAgents}
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#064e3b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Ready
                </Typography>
              </Box>
            </Box>

            {/* Working */}
            {workingAgents > 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  bgcolor: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: 3,
                  px: 2.5,
                  py: 1.5,
                  minWidth: 170,
                }}
              >
                <PendingIcon sx={{ color: "#d97706", fontSize: 22 }} />
                <Box>
                  <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                    {workingAgents}
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "#92400e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Working
                  </Typography>
                </Box>
              </Box>
            )}
          </Stack>
        </Box>
      </Box>

      {/* ── US IPO Signal Board Section ── */}
      <Box sx={{ maxWidth: 1320, mx: "auto", px: { xs: 2, md: 5 }, pt: 3, pb: 1 }}>
        <Box
          sx={{
            bgcolor: "#fff",
            border: "1px solid #c7d2fe",
            borderRadius: 3,
            p: 2.5,
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "0.95rem", md: "1.1rem" },
              fontWeight: 700,
              color: "#111827",
              mb: 1.5,
              letterSpacing: "-0.025em",
            }}
          >
            US IPO Signal Board
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 1.5,
            }}
          >
            {/* Upcoming IPOs Card */}
            <Box
              onClick={() => navigate("/summary_signal_board?tab=upcoming")}
              sx={{
                bgcolor: "#f8f9ff",
                border: "1px solid #e0e7ff",
                borderRadius: 2,
                p: 1.8,
                cursor: "pointer",
                transition: "all 0.3s ease",
                position: "relative",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(79, 70, 229, 0.12)",
                  borderColor: "#4f46e5",
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 24,
                  height: 24,
                  borderRadius: "4px",
                  border: "1.5px solid #4f46e5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  color: "#4f46e5",
                  opacity: 0.6,
                  transition: "all 0.2s",
                  "&:hover": {
                    opacity: 1,
                    backgroundColor: "#f3e8fe",
                  },
                }}
              >
                ↗
              </Box>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: "#ede9fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                }}
              >
                <Typography sx={{ fontSize: "1.1rem" }}>📈</Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "0.85rem", mb: 0.2 }}>
                Upcoming IPOs
              </Typography>
              {/* <Typography sx={{ color: "#64748b", fontSize: "0.75rem" }}>
                Analyze opportunities
              </Typography> */}
            </Box>

            {/* Current Portfolio Card */}
            <Box
              onClick={() => navigate("/summary_signal_board?tab=portfolio")}
              sx={{
                bgcolor: "#f0fdf4",
                border: "1px solid #dcfce7",
                borderRadius: 2,
                p: 1.8,
                cursor: "pointer",
                transition: "all 0.3s ease",
                position: "relative",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(5, 150, 105, 0.12)",
                  borderColor: "#059669",
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 24,
                  height: 24,
                  borderRadius: "4px",
                  border: "1.5px solid #059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  color: "#059669",
                  opacity: 0.6,
                  transition: "all 0.2s",
                  "&:hover": {
                    opacity: 1,
                    backgroundColor: "#d1fae5",
                  },
                }}
              >
                ↗
              </Box>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: "#d1fae5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                }}
              >
                <Typography sx={{ fontSize: "1.1rem" }}>💼</Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "0.85rem", mb: 0.2 }}>
                Current Portfolio: IPOs
              </Typography>
              {/* <Typography sx={{ color: "#64748b", fontSize: "0.75rem" }}>
                Monitor trading IPOs
              </Typography> */}
            </Box>

            {/* Recently Traded Card */}
            <Box
              onClick={() => navigate("/summary_signal_board?tab=recent")}
              sx={{
                bgcolor: "#fef2f2",
                border: "1px solid #fee2e2",
                borderRadius: 2,
                p: 1.8,
                cursor: "pointer",
                transition: "all 0.3s ease",
                position: "relative",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(220, 38, 38, 0.12)",
                  borderColor: "#dc2626",
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 24,
                  height: 24,
                  borderRadius: "4px",
                  border: "1.5px solid #dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  color: "#dc2626",
                  opacity: 0.6,
                  transition: "all 0.2s",
                  "&:hover": {
                    opacity: 1,
                    backgroundColor: "#fee2e2",
                  },
                }}
              >
                ↗
              </Box>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                }}
              >
                <Typography sx={{ fontSize: "1.1rem" }}>📊</Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "0.85rem", mb: 0.2 }}>
                Recently Traded IPOs(Last 60 days)
              </Typography>
              {/* <Typography sx={{ color: "#64748b", fontSize: "0.75rem" }}>
                Review listed IPOs
              </Typography> */}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Agent Grid ── */}
      <Box sx={{ maxWidth: 1320, mx: "auto", px: { xs: 2, md: 5 }, py: 4 }}>
        {loading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Box
                key={i}
                sx={{
                  height: 340,
                  borderRadius: 4,
                  bgcolor: "#fff",
                  border: "1px solid #c7d2fe",
                  animation: "pulse 1.5s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                  },
                }}
              />
            ))}
          </Box>
        ) : agents.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 10,
              px: 4,
              bgcolor: "#fff",
              borderRadius: 4,
              border: "1px solid #c7d2fe",
            }}
          >
            <SmartToyOutlinedIcon sx={{ fontSize: 56, color: "#4f46e5", mb: 2 }} />
            <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", color: "#111827", mb: 1 }}>
              No agents found
            </Typography>
            <Typography sx={{ color: "#374151", mb: 3, maxWidth: 380, mx: "auto" }}>
              {isAdmin
                ? "Create your first AI agent to get started."
                : "No agents have been set up yet. Contact your admin."}
            </Typography>
            {isAdmin && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateOpen(true)}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3.5,
                  py: 1.1,
                  borderRadius: 2.5,
                  bgcolor: "#4f46e5",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#4338ca" },
                }}
              >
                Create Agent
              </Button>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {agents.map((agent, index) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                index={index + 1}
                onEmailToggle={handleEmailToggle}
                onDelete={handleDeleteRequest}
                onEdit={(a) => {
                  setAgentToEdit(a);
                  setEditOpen(true);
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Create Agent Dialog */}
      <CreateAgentDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={loadAgents}
      />

      {/* Edit Agent Dialog */}
      <EditAgentDialog
        open={editOpen}
        agent={agentToEdit}
        onClose={() => { setEditOpen(false); setAgentToEdit(null); }}
        onUpdated={loadAgents}
      />

      {/* Admin Gate Dialog */}
      <Dialog
        open={adminGateOpen}
        onClose={() => setAdminGateOpen(false)}
        PaperProps={{ sx: { borderRadius: 4, border: "1px solid #c7d2fe" } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 700, color: "#111827" }}>
          <LockOutlinedIcon sx={{ color: "#4f46e5" }} />
          Admin Access Required
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#1e293b" }}>
            Creating new agents is restricted to administrators. Please reach out to your MIDAS admin to request a new agent be set up.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setAdminGateOpen(false)}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2.5,
              bgcolor: "#4f46e5",
              boxShadow: "none",
              "&:hover": { bgcolor: "#4338ca" },
            }}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 4, border: "1px solid #fecaca" } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#991b1b" }}>Delete Agent</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{agentToDelete?.name}"? This will also remove all its output history. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting} sx={{ textTransform: "none", borderRadius: 2.5 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2.5, boxShadow: "none" }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Agents;
