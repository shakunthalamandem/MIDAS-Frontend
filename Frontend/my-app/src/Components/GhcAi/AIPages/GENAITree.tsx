import React from "react";
import { Treemap, ResponsiveContainer } from "recharts";
import { Paper, Typography, Box } from "@mui/material";
import ReactMarkdown from "react-markdown";

interface TreeNode {
  name: string;
  value?: number;
  children?: TreeNode[];
}

interface GENAITreeProps {
  title?: string;
  data: TreeNode;
}

const GENAITree: React.FC<GENAITreeProps> = ({ title, data }) => {
  return (
    <Paper
      sx={{
        p: 2,
        m: 2,
        borderRadius: 3,
        background: "linear-gradient(135deg, #f5f7fa, #e4ecf7)",
        boxShadow: 3,
        height: 300,
      }}
    >
      {title && (
        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{ color: "#2c387e", mb: 1 }}
        >
          <ReactMarkdown>{title}</ReactMarkdown>
        </Typography>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          width={400}
          height={200}
          data={data.children || []}
          dataKey="value"
          stroke="#fff"
          fill="#60a5fa"
        />
      </ResponsiveContainer>
    </Paper>
  );
};

export default GENAITree;
