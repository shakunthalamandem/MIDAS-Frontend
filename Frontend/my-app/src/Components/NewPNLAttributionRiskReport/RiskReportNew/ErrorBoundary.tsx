import React, { ReactNode, ErrorInfo } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
            px: 2,
          }}
        >
          <Paper
            sx={{
              maxWidth: 500,
              width: "100%",
              p: 4,
              borderRadius: 3,
              boxShadow: "0 12px 48px rgba(0,0,0,0.25)",
              backgroundColor: "#fff",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ErrorOutlineIcon sx={{ color: "#fff", fontSize: 36 }} />
              </Box>
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                color: "#0f172a",
                textAlign: "center",
              }}
            >
              Something went wrong
            </Typography>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: 14,
                lineHeight: 1.6,
                mb: 2.5,
                textAlign: "center",
              }}
            >
              An unexpected error occurred while processing your request.
            </Typography>

            <Box
              sx={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 2,
                p: 2.5,
                mb: 3,
                maxHeight: 150,
                overflowY: "auto",
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  color: "#991b1b",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  lineHeight: 1.4,
                }}
              >
                {this.state.error?.message || "Unknown error"}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={this.handleReset}
              sx={{
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#fff",
                fontWeight: 600,
                py: 1.2,
                textTransform: "none",
                fontSize: 14,
                "&:hover": {
                  background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
                },
              }}
              startIcon={<RefreshIcon />}
            >
              Try Again
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
