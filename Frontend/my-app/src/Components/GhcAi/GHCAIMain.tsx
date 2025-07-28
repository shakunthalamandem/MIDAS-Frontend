import React, { useEffect, useState } from "react";
import { Container, Typography, CircularProgress } from "@mui/material";
import GENAIRenderer from "./AIPages/GENAIRenderer";

const GHCAIMain: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/GHC_AI.json")
      .then((res) => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("JSON load error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>📊 Golden Hills Capital Dashboard</Typography>
      {loading ? <CircularProgress /> : <GENAIRenderer blocks={data} />}
    </Container>
  );
};

export default GHCAIMain;
