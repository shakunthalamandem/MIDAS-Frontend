import React from "react";
import { Box, Typography } from "@mui/material";
import GenericDataRenderer from "./GenericDataRenderer";
import ImmediateDecisionCard from "./ImmediateDecisionCard";

interface Props {
  data: any;
}

export const extractImmediateDecisionItems = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.flagged_positions || data.items || data.decisions || data.rows || data.actions || [];
};

const ImmediateDecisions: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  if (typeof data === "string") {
    return (
      <Box sx={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 2.5, p: 2.5 }}>
        <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{data}</Typography>
      </Box>
    );
  }

  const items: any[] = extractImmediateDecisionItems(data);

  if (items.length === 0) {
    return <GenericDataRenderer data={data} accentColor="#ec4899" />;
  }

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
      {items.map((item: any, i: number) => (
        <ImmediateDecisionCard key={i} item={item} />
      ))}
    </Box>
  );
};

export default ImmediateDecisions;
