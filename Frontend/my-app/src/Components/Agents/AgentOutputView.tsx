import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import RefreshIcon from "@mui/icons-material/Refresh";
import { AgentOutput, AgentOutputSection } from "./types";
import { fetchLatestOutput, fetchOutputById } from "./agentService";

const POLL_INTERVAL_MS = 10_000; // 10 seconds

const AgentOutputView: React.FC = () => {
  const { agentId, outputId } = useParams<{ agentId?: string; outputId?: string }>();
  const navigate = useNavigate();

  const [output, setOutput] = useState<AgentOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOutput = useCallback(async () => {
    try {
      let data: AgentOutput | null = null;
      if (outputId) {
        data = await fetchOutputById(Number(outputId));
      } else if (agentId) {
        data = await fetchLatestOutput(Number(agentId));
      }
      setOutput(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load output");
    } finally {
      setLoading(false);
    }
  }, [agentId, outputId]);

  useEffect(() => {
    loadOutput();
  }, [loadOutput]);

  // Poll while status is pending/running
  useEffect(() => {
    if (!output || output.status === "completed" || output.status === "failed") return;

    const interval = setInterval(() => {
      loadOutput();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [output, loadOutput]);

  const statusConfig = {
    pending: { color: "#f59e0b", bg: "#fef3c7", icon: <HourglassEmptyIcon />, label: "Agent Working" },
    running: { color: "#f59e0b", bg: "#fef3c7", icon: <HourglassEmptyIcon />, label: "Agent Processing" },
    completed: { color: "#10b981", bg: "#d1fae5", icon: <CheckCircleOutlineIcon />, label: "Completed" },
    failed: { color: "#ef4444", bg: "#fee2e2", icon: <ErrorOutlineIcon />, label: "Failed" },
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ backgroundColor: "#edf0f7", minHeight: "100vh", p: 4 }}>
        <Box sx={{ maxWidth: 1000, mx: "auto" }}>
          <Alert severity="error">{error}</Alert>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/agents/dashboard")} sx={{ mt: 2 }}>
            Back to Agents
          </Button>
        </Box>
      </Box>
    );
  }

  if (!output) {
    return (
      <Box sx={{ backgroundColor: "#edf0f7", minHeight: "100vh", p: 4 }}>
        <Box sx={{ maxWidth: 1000, mx: "auto" }}>
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <HourglassEmptyIcon sx={{ fontSize: 48, color: "#f59e0b", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No output available yet
            </Typography>
            <Typography color="text.secondary" mb={3}>
              This agent hasn't been run yet or is still processing. Results will appear here once ready.
            </Typography>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/agents/dashboard")}>
              Back to Agents
            </Button>
          </Paper>
        </Box>
      </Box>
    );
  }

  const statusInfo = statusConfig[output.status] || statusConfig.pending;
  const resultJson = output.result_json;

  return (
    <Box sx={{ backgroundColor: "#edf0f7", minHeight: "100vh", p: 4 }}>
      <Box sx={{ maxWidth: 1000, mx: "auto" }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/agents/dashboard")}
                sx={{ textTransform: "none" }}
              >
                Back
              </Button>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#481f93" }}>
                {output.agent_name}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Chip
                icon={statusInfo.icon as React.ReactElement}
                label={statusInfo.label}
                sx={{
                  bgcolor: statusInfo.bg,
                  color: statusInfo.color,
                  fontWeight: 600,
                  "& .MuiChip-icon": { color: statusInfo.color },
                }}
              />
              {(output.status === "pending" || output.status === "running") && (
                <CircularProgress size={20} sx={{ color: "#f59e0b" }} />
              )}
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={loadOutput}
                sx={{ textTransform: "none" }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>

          {/* Meta info */}
          <Stack direction="row" spacing={3} mt={2} flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              Run: {new Date(output.created_at).toLocaleString("en-IN")}
            </Typography>
            {output.completed_at && (
              <Typography variant="body2" color="text.secondary">
                Completed: {new Date(output.completed_at).toLocaleString("en-IN")}
              </Typography>
            )}
            {output.triggered_by_email && (
              <Typography variant="body2" color="text.secondary">
                Triggered by: {output.triggered_by_email}
              </Typography>
            )}
          </Stack>
        </Paper>

        {/* Pending/Running state */}
        {(output.status === "pending" || output.status === "running") && (
          <Paper sx={{ p: 6, textAlign: "center", border: "2px solid #f59e0b", borderRadius: 3 }}>
            <HourglassEmptyIcon sx={{ fontSize: 56, color: "#f59e0b", mb: 2 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Agent is working on your request...
            </Typography>
            <Typography color="text.secondary" mb={2}>
              The agent is currently processing. Results will appear here automatically.
              You can close this tab — the agent will continue running in the background.
            </Typography>
            <CircularProgress size={28} sx={{ color: "#f59e0b" }} />
          </Paper>
        )}

        {/* Failed state */}
        {output.status === "failed" && (
          <Paper sx={{ p: 4, border: "2px solid #ef4444", borderRadius: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              Agent execution failed
            </Alert>
            {output.error_message && (
              <Typography variant="body2" sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                {output.error_message}
              </Typography>
            )}
          </Paper>
        )}

        {/* Completed state — render structured JSON */}
        {output.status === "completed" && resultJson && (
          <Stack spacing={3}>
            {/* Summary */}
            {resultJson.summary && (
              <Paper sx={{ p: 3, borderLeft: "4px solid #5b2fff" }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Executive Summary
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {resultJson.summary}
                </Typography>
              </Paper>
            )}

            {/* Sections */}
            {resultJson.sections?.map((section, idx) => (
              <Paper key={idx} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: "#481f93" }}>
                  {section.title}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <SectionRenderer section={section} />
              </Paper>
            ))}

            {/* Metadata */}
            {resultJson.metadata && (
              <Paper sx={{ p: 2, bgcolor: "#f8f7ff" }}>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  {resultJson.metadata.confidence && (
                    <Chip
                      label={`Confidence: ${resultJson.metadata.confidence}`}
                      size="small"
                      sx={{
                        bgcolor:
                          resultJson.metadata.confidence === "high" ? "#d1fae5" :
                          resultJson.metadata.confidence === "medium" ? "#fef3c7" : "#fee2e2",
                      }}
                    />
                  )}
                  {resultJson.metadata.analysis_date && (
                    <Chip label={`Analysis Date: ${resultJson.metadata.analysis_date}`} size="small" variant="outlined" />
                  )}
                  {resultJson.metadata.data_sources?.map((src, i) => (
                    <Chip key={i} label={src} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Paper>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

/** Renders a single section based on its type */
const SectionRenderer: React.FC<{ section: AgentOutputSection }> = ({ section }) => {
  if (section.type === "text") {
    return (
      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
        {section.content}
      </Typography>
    );
  }

  if (section.type === "list" && section.items) {
    return (
      <Box component="ul" sx={{ pl: 3, m: 0 }}>
        {section.items.map((item, i) => (
          <Box component="li" key={i} sx={{ mb: 0.5 }}>
            <Typography variant="body2">{item}</Typography>
          </Box>
        ))}
      </Box>
    );
  }

  if (section.type === "table" && section.headers && section.rows) {
    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#f0f0ff" }}>
              {section.headers.map((h, i) => (
                <TableCell key={i} sx={{ fontWeight: 700 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {section.rows.map((row, i) => (
              <TableRow key={i} sx={{ "&:nth-of-type(even)": { bgcolor: "#fafafa" } }}>
                {row.map((cell, j) => (
                  <TableCell key={j}>{String(cell)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // Fallback
  return (
    <Typography variant="body2" color="text.secondary">
      {JSON.stringify(section, null, 2)}
    </Typography>
  );
};

export default AgentOutputView;
