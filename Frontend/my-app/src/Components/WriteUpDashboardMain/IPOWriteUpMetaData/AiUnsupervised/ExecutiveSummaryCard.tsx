import React from "react";
import { Box, Typography } from "@mui/material";

type ExecutiveSummaryCardProps = {
  companyName: string;
  summary?: string;
};

const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({ companyName, summary }) => {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
        background: "#f7f9fcff",
        boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
        p: { xs: 2.5, sm: 3.5 },
      }}
    >
      <Typography
        variant="h6"
        sx={{ color: "#1d2b5a", fontWeight: 600, textAlign: "center" }}
      >
      Proprietary Model Indication 
      </Typography>
      <Typography
        variant="body1"
        sx={{ mt: 2, color: "#141414", whiteSpace: "pre-line", lineHeight: 1.8 }}
      >
        {summary || "AI-generated outlook will appear here once available."}
      </Typography>
    </Box>
  );
};

export default ExecutiveSummaryCard;
