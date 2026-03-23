import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AddIcon from "@mui/icons-material/Add";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import AgentCard from "./AgentCards/AgentCard";
import CreateAgentDialog from "./CreateAgentDialog";
import { AIAgent } from "./types";
import { fetchAgents, toggleEmailPreference, deleteAgent } from "./agentService";

const Agents: React.FC = () => {
  const isAdmin = localStorage.getItem("is_superuser") === "true";

  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [adminGateOpen, setAdminGateOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<AIAgent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const loadAgents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAgents();
      setAgents(data);
    } catch (err) {
      console.error("Failed to load agents:", err);
      setSnackbar({
        open: true,
        message: "Failed to load agents",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const handleEmailToggle = async (agent: AIAgent, enabled: boolean) => {
    // Optimistic update
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agent.id ? { ...a, email_enabled: enabled } : a
      )
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
      // Revert on failure
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agent.id ? { ...a, email_enabled: !enabled } : a
        )
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
      setSnackbar({
        open: true,
        message: `Agent "${agentToDelete.name}" deleted`,
        severity: "success",
      });
      setDeleteDialogOpen(false);
      setAgentToDelete(null);
      loadAgents();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to delete agent",
        severity: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const totalAgents = agents.length;

  return (
    <Box sx={{ backgroundColor: "#edf0f7", minHeight: "100vh", p: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Header */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "#efd4ff" }}>
                <AutoAwesomeIcon sx={{ color: "#5b2fff" }} />
              </Avatar>

              <Box>
                <Typography variant="h4" fontWeight={700}>
                  MIDAS AI Agents
                </Typography>
                <Typography color="text.secondary">
                  Autonomous financial AI agents that continuously analyze
                  markets and deliver actionable insights.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              startIcon={isAdmin ? <AddIcon /> : <LockOutlinedIcon />}
              onClick={() => isAdmin ? setCreateOpen(true) : setAdminGateOpen(true)}
              sx={{
                textTransform: "none",
                bgcolor: isAdmin ? "#5b2fff" : "#6b7280",
                "&:hover": { bgcolor: isAdmin ? "#481f93" : "#4b5563" },
                whiteSpace: "nowrap",
              }}
            >
              Create Agent
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} mt={2}>
            <Chip label={`${totalAgents} Agents`} color="info" />
            <Chip label={`${totalAgents} Active`} color="success" />
          </Stack>
        </Paper>

        {/* Agent grid */}
        {loading ? (
          <Typography textAlign="center" py={4} color="text.secondary">
            Loading agents...
          </Typography>
        ) : agents.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No agents found
            </Typography>
            <Typography color="text.secondary" mb={2}>
              {isAdmin ? "Create your first AI agent to get started." : "No agents have been set up yet. Contact your admin."}
            </Typography>
            {isAdmin && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateOpen(true)}
              >
                Create Agent
              </Button>
            )}
          </Paper>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
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
                onEdit={() => {
                  setSnackbar({
                    open: true,
                    message: "Edit functionality coming soon",
                    severity: "success",
                  });
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Create Agent Dialog — admin only */}
      <CreateAgentDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={loadAgents}
      />

      {/* Admin Gate Dialog — shown to non-admin users */}
      <Dialog open={adminGateOpen} onClose={() => setAdminGateOpen(false)}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LockOutlinedIcon sx={{ color: "#6b7280" }} />
          Admin Access Required
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Creating new agents is restricted to administrators. Please reach
            out to your MIDAS admin to request a new agent be set up.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminGateOpen(false)} variant="contained" sx={{ bgcolor: "#5b2fff", "&:hover": { bgcolor: "#481f93" }, textTransform: "none" }}>
            Got it
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Agent</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{agentToDelete?.name}"? This will
            also remove all its output history. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Agents;
