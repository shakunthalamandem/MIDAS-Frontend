import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import { motion } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import SecurityIcon from "@mui/icons-material/Security";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import sql from "react-syntax-highlighter/dist/esm/languages/hljs/sql";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { FilterRule } from "../types";
import { generateSelectQuery, isQuerySafe } from "../utils";

SyntaxHighlighter.registerLanguage("sql", sql);

const MotionButton = motion(Button);

interface QueryPreviewModalProps {
  open: boolean;
  onClose: () => void;
  table: string;
  columns: string[];
  filters: FilterRule[];
}

const QueryPreviewModal: React.FC<QueryPreviewModalProps> = ({
  open,
  onClose,
  table,
  columns,
  filters,
}) => {
  const [copied, setCopied] = useState(false);
  const [limit, setLimit] = useState<number>(100);

  const query = useMemo(
    () => generateSelectQuery(table, columns, filters, limit),
    [table, columns, filters, limit]
  );

  const safe = useMemo(() => isQuerySafe(query), [query]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(query);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = query;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #0a1628 0%, #162544 100%)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 800 }}>
            Generated PostgreSQL Query
          </Typography>
          <Chip
            icon={<SecurityIcon sx={{ fontSize: 14, color: "#34d399 !important" }} />}
            label="READ-ONLY"
            size="small"
            sx={{
              height: 24,
              fontSize: "0.65rem",
              fontWeight: 700,
              bgcolor: "rgba(52,211,153,0.15)",
              color: "#34d399",
              border: "1px solid rgba(52,211,153,0.3)",
            }}
          />
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#94a3b8" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Safety Warning */}
        {!safe && (
          <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
            This query contains unsafe SQL keywords and should not be executed.
          </Alert>
        )}

        {/* Query Display */}
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              borderRadius: 2.5,
              overflow: "hidden",
              border: "1px solid #334155",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1,
                bgcolor: "#1e293b",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", gap: 0.6 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#ef4444",
                  }}
                />
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#fbbf24",
                  }}
                />
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#34d399",
                  }}
                />
              </Box>
              <Typography
                sx={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 600 }}
              >
                PostgreSQL
              </Typography>
            </Box>
            <SyntaxHighlighter
              language="sql"
              style={atomOneDark}
              customStyle={{
                margin: 0,
                padding: "20px",
                fontSize: "0.85rem",
                lineHeight: 1.6,
                background: "#0f172a",
              }}
              showLineNumbers
              lineNumberStyle={{ color: "#475569", fontSize: "0.75rem" }}
            >
              {query}
            </SyntaxHighlighter>
          </Box>

          {/* Limit Control */}
          <Box sx={{ mt: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#475569" }}
            >
              LIMIT:
            </Typography>
            {[50, 100, 250, 500, 1000].map((val) => (
              <Chip
                key={val}
                label={val}
                size="small"
                onClick={() => setLimit(val)}
                sx={{
                  height: 26,
                  fontSize: "0.72rem",
                  fontWeight: limit === val ? 700 : 500,
                  bgcolor: limit === val ? "#eff6ff" : "#f8fafc",
                  color: limit === val ? "#1d4ed8" : "#64748b",
                  border: `1px solid ${limit === val ? "#93c5fd" : "#e2e8f0"}`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: "#3b82f6" },
                }}
              />
            ))}
          </Box>

          {/* Info */}
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: "#f0fdf4",
              borderRadius: 2,
              border: "1px solid #bbf7d0",
            }}
          >
            <Typography sx={{ fontSize: "0.72rem", color: "#065f46" }}>
              This query is safe to copy and paste into{" "}
              <strong>TablePlus</strong> or any PostgreSQL client. Only{" "}
              <code
                style={{
                  background: "#dcfce7",
                  padding: "1px 4px",
                  borderRadius: 3,
                }}
              >
                SELECT
              </code>{" "}
              queries are generated — no data modifications are possible.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid #e2e8f0",
          bgcolor: "#f8fafc",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            color: "#64748b",
            fontWeight: 600,
          }}
        >
          Close
        </Button>
        <MotionButton
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          variant="contained"
          onClick={handleCopy}
          startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
          sx={{
            bgcolor: copied ? "#059669" : "#3b82f6",
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            px: 3,
            boxShadow: copied
              ? "0 2px 12px rgba(5,150,105,0.35)"
              : "0 2px 12px rgba(59,130,246,0.35)",
            "&:hover": { bgcolor: copied ? "#047857" : "#2563eb" },
          }}
        >
          {copied ? "Copied!" : "Copy Query"}
        </MotionButton>
      </DialogActions>
    </Dialog>
  );
};

export default QueryPreviewModal;
