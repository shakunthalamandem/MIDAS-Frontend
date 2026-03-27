import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import { AgentOutput, AgentOutputSection } from "./types";
import { fetchLatestOutput, fetchOutputById } from "./agentService";

const POLL_INTERVAL_MS = 10_000;

const AgentOutputView: React.FC = () => {
  const { agentId, outputId } = useParams<{
    agentId?: string;
    outputId?: string;
  }>();
  const navigate = useNavigate();

  const [output, setOutput] = useState<AgentOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOutput = useCallback(async () => {
    try {
      let data: AgentOutput | null = null;
      if (outputId) data = await fetchOutputById(Number(outputId));
      else if (agentId) data = await fetchLatestOutput(Number(agentId));
      setOutput(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load output");
    } finally {
      setLoading(false);
    }
  }, [agentId, outputId]);

  useEffect(() => { loadOutput(); }, [loadOutput]);

  useEffect(() => {
    if (!output || output.status === "completed" || output.status === "failed")
      return;
    const interval = setInterval(loadOutput, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [output, loadOutput]);

  const statusConfig: Record<
    string,
    { color: string; bg: string; icon: React.ReactNode; label: string }
  > = {
    pending: {
      color: "#d97706",
      bg: "#fffbeb",
      icon: <HourglassEmptyIcon />,
      label: "Agent Working",
    },
    running: {
      color: "#d97706",
      bg: "#fffbeb",
      icon: <HourglassEmptyIcon />,
      label: "Agent Processing",
    },
    completed: {
      color: "#059669",
      bg: "#ecfdf5",
      icon: <CheckCircleOutlineIcon />,
      label: "Completed",
    },
    failed: {
      color: "#dc2626",
      bg: "#fef2f2",
      icon: <ErrorOutlineIcon />,
      label: "Failed",
    },
  };

  /* Loading */
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: "#4f46e5" }} />
        <Typography sx={{ color: "#1e293b", fontWeight: 500 }}>
          Loading agent output...
        </Typography>
      </Box>
    );
  }

  /* Error */
  if (error) {
    return (
      <Box sx={{ bgcolor: "#e8eaf0", minHeight: "100vh", p: 4 }}>
        <Box sx={{ maxWidth: 1000, mx: "auto" }}>
          <Alert severity="error" sx={{ borderRadius: 3, mb: 2 }}>{error}</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/agents/dashboard")}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Back to Agents
          </Button>
        </Box>
      </Box>
    );
  }

  /* No output */
  if (!output) {
    return (
      <Box sx={{ bgcolor: "#e8eaf0", minHeight: "100vh", p: 4 }}>
        <Box sx={{ maxWidth: 560, mx: "auto", textAlign: "center", py: 10 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              bgcolor: "#fffbeb",
              border: "1px solid #fde68a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <HourglassEmptyIcon sx={{ fontSize: 32, color: "#d97706" }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", color: "#111827", mb: 1 }}>
            No output available yet
          </Typography>
          <Typography sx={{ color: "#1e293b", mb: 4, lineHeight: 1.7 }}>
            This agent hasn't been run yet or is still processing. Results
            will appear here once ready.
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/agents/dashboard")}
            sx={{ textTransform: "none", fontWeight: 600, color: "#4f46e5" }}
          >
            Back to Agents
          </Button>
        </Box>
      </Box>
    );
  }

  const statusInfo = statusConfig[output.status] || statusConfig.pending;
  const resultJson = output.result_json;

  return (
    <Box sx={{ bgcolor: "#e8eaf0", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#fff",
          borderBottom: "1px solid #c7d2fe",
          px: { xs: 2, md: 5 },
          py: 2.5,
        }}
      >
        <Box sx={{ maxWidth: 1000, mx: "auto" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/agents/dashboard")}
                sx={{
                  textTransform: "none",
                  color: "#1e293b",
                  fontWeight: 600,
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#e0e7ff" },
                }}
              >
                Back
              </Button>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: "#4f46e5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SmartToyOutlinedIcon sx={{ color: "#fff", fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", color: "#111827" }}>
                {output.agent_name}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Chip
                icon={statusInfo.icon as React.ReactElement}
                label={statusInfo.label}
                size="small"
                sx={{
                  bgcolor: statusInfo.bg,
                  color: statusInfo.color,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  "& .MuiChip-icon": { color: statusInfo.color },
                }}
              />
              {(output.status === "pending" || output.status === "running") && (
                <CircularProgress size={16} sx={{ color: "#d97706" }} />
              )}
              <Button
                size="small"
                startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                onClick={loadOutput}
                sx={{
                  textTransform: "none",
                  color: "#1e293b",
                  fontWeight: 600,
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#e0e7ff" },
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>

          {/* Meta */}
          <Stack direction="row" spacing={3} mt={1.5} flexWrap="wrap">
            <Typography sx={{ fontSize: "0.78rem", color: "#1e293b" }}>
              Run: {new Date(output.created_at).toLocaleString("en-IN")}
            </Typography>
            {output.completed_at && (
              <Typography sx={{ fontSize: "0.78rem", color: "#1e293b" }}>
                Completed: {new Date(output.completed_at).toLocaleString("en-IN")}
              </Typography>
            )}
            {output.triggered_by_email && (
              <Typography sx={{ fontSize: "0.78rem", color: "#1e293b" }}>
                By: {output.triggered_by_email}
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 5 }, py: 4 }}>
        {/* Pending / Running */}
        {(output.status === "pending" || output.status === "running") && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 4,
              bgcolor: "#fff",
              borderRadius: 4,
              border: "1px solid #fde68a",
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                bgcolor: "#fffbeb",
                border: "1px solid #fde68a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <HourglassEmptyIcon sx={{ fontSize: 32, color: "#d97706" }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#111827", mb: 1 }}>
              Agent is working on your request...
            </Typography>
            <Typography sx={{ color: "#1e293b", maxWidth: 420, mx: "auto", lineHeight: 1.7, mb: 2 }}>
              Results will appear here automatically. You can close this tab
              — the agent will continue running in the background.
            </Typography>
            <CircularProgress size={24} sx={{ color: "#d97706" }} />
          </Box>
        )}

        {/* Failed */}
        {output.status === "failed" && (
          <Box
            sx={{
              p: 4,
              bgcolor: "#fff",
              borderRadius: 4,
              border: "1px solid #fecaca",
            }}
          >
            <Alert severity="error" sx={{ borderRadius: 2.5, mb: 2, fontWeight: 600 }}>
              Agent execution failed
            </Alert>
            {output.error_message && (
              <Typography
                sx={{
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  fontSize: "0.82rem",
                  color: "#1e293b",
                  p: 2,
                  bgcolor: "#eef2ff",
                  borderRadius: 2,
                  border: "1px solid #a5b4fc",
                }}
              >
                {output.error_message}
              </Typography>
            )}
          </Box>
        )}

        {/* Completed */}
        {output.status === "completed" && resultJson && (
          <Stack spacing={3}>
            {/* Summary */}
            {resultJson.summary && (
              <Box
                sx={{
                  p: 3,
                  bgcolor: "#fff",
                  borderRadius: 4,
                  border: "1px solid #c7d2fe",
                  borderLeft: "4px solid #4f46e5",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    color: "#1e293b",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    mb: 1,
                  }}
                >
                  Executive Summary
                </Typography>
                <Typography
                  sx={{ fontWeight: 600, color: "#111827", lineHeight: 1.7, fontSize: "0.92rem" }}
                >
                  {resultJson.summary}
                </Typography>
              </Box>
            )}

            {/* Sections */}
            {resultJson.sections?.map((section, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 3,
                  bgcolor: "#fff",
                  borderRadius: 4,
                  border: "1px solid #c7d2fe",
                }}
              >
                <Typography
                  sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827", mb: 1.5 }}
                >
                  {section.title}
                </Typography>
                <Box sx={{ height: 1, bgcolor: "#c7d2fe", mb: 2 }} />
                <SectionRenderer section={section} />
              </Box>
            ))}

            {/* Metadata */}
            {resultJson.metadata && (
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: "#eef2ff",
                  borderRadius: 3,
                  border: "1px solid #a5b4fc",
                }}
              >
                <Stack direction="row" spacing={1.5} flexWrap="wrap">
                  {resultJson.metadata.confidence && (
                    <Chip
                      label={`Confidence: ${resultJson.metadata.confidence}`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        borderRadius: 2,
                        bgcolor:
                          resultJson.metadata.confidence === "high"
                            ? "#ecfdf5"
                            : resultJson.metadata.confidence === "medium"
                            ? "#fffbeb"
                            : "#fef2f2",
                        color:
                          resultJson.metadata.confidence === "high"
                            ? "#059669"
                            : resultJson.metadata.confidence === "medium"
                            ? "#d97706"
                            : "#dc2626",
                      }}
                    />
                  )}
                  {resultJson.metadata.analysis_date && (
                    <Chip
                      label={`Analysis: ${resultJson.metadata.analysis_date}`}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 2, fontWeight: 600 }}
                    />
                  )}
                  {resultJson.metadata.data_sources?.map((src, i) => (
                    <Chip
                      key={i}
                      label={src}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 2, fontWeight: 500 }}
                    />
                  ))}
                </Stack>
              </Box>
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
      <Typography
        sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8, color: "#1e293b", fontSize: "0.88rem" }}
      >
        {section.content}
      </Typography>
    );
  }

  if (section.type === "list" && section.items) {
    return (
      <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
        {section.items.map((item, i) => (
          <Box component="li" key={i} sx={{ mb: 0.8, "&::marker": { color: "#4f46e5" } }}>
            <Typography sx={{ fontSize: "0.88rem", color: "#1e293b", lineHeight: 1.7 }}>
              {item}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  if (section.type === "table" && section.headers && section.rows) {
    return (
      <TableContainer
        sx={{
          borderRadius: 2.5,
          border: "1px solid #c7d2fe",
          overflow: "hidden",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#eef2ff" }}>
              {section.headers.map((h, i) => (
                <TableCell
                  key={i}
                  sx={{
                    fontWeight: 700,
                    color: "#111827",
                    fontSize: "0.78rem",
                    borderBottom: "2px solid #e8e8ef",
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {section.rows.map((row, i) => (
              <TableRow
                key={i}
                sx={{
                  "&:nth-of-type(even)": { bgcolor: "#fafafa" },
                  "&:hover": { bgcolor: "#e0e7ff" },
                  transition: "background 0.15s",
                }}
              >
                {row.map((cell, j) => (
                  <TableCell key={j} sx={{ fontSize: "0.82rem", color: "#1e293b" }}>
                    {String(cell)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Typography
      sx={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#1e293b", whiteSpace: "pre-wrap" }}
    >
      {JSON.stringify(section, null, 2)}
    </Typography>
  );
};

export default AgentOutputView;
