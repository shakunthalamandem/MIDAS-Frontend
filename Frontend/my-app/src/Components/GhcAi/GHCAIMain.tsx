import React from "react";
import { Container, Typography, CircularProgress, Alert } from "@mui/material";
import GENAIRenderer from "./AIPages/GENAIRenderer";

interface GHCAIMainProps {
  data: any[];
  loading: boolean;
  error?: string | null;
}

const GHCAIMain: React.FC<GHCAIMainProps> = ({ data, loading, error }) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
     
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && <GENAIRenderer blocks={data} />}
    </Container>
  );
};

export default GHCAIMain;
