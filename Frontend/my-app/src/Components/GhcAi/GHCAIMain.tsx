import React from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import GENAIRenderer from "./AIPages/GENAIRenderer";

interface GHCAIMainProps {
  data: any[];
  loading: boolean;
  error?: string | null;
}

const GHCAIMain: React.FC<GHCAIMainProps> = ({ data, loading, error }) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {loading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "40vh",
            gap: 2,
          }}
        >
          <CircularProgress size={48} sx={{ color: "#6A1B9A" }} />
          <Typography variant="h6" sx={{ color: "#6A1B9A" }}>
            Loading AI Content…
          </Typography>
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && <GENAIRenderer blocks={data} />}
    </Container>
  );
};

export default GHCAIMain;
