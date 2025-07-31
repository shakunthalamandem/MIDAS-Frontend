// src/components/GENAITree.tsx
import React, { useRef, useEffect, useState } from "react";
import Tree from "react-d3-tree";
import { Card, CardHeader, CardContent, Typography } from "@mui/material";

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

interface GENAITreeProps {
  title: string;
  data: TreeNode;
}

const GENAITree: React.FC<GENAITreeProps> = ({ title, data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  useEffect(() => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      setDimensions({ width: offsetWidth, height: offsetHeight });
    }
  }, []);

  return (
   <Card
  elevation={3}
  sx={{
    borderRadius: 3,
    backgroundColor: "#d8e2faff",
    padding: 1,
  }}
>
  <CardHeader
    title={
      <Typography
        variant="h6"
        sx={{
          color: "#002060",
          fontWeight: 600,
          fontFamily: "Roboto, sans-serif",
        }}
      >
        {title}
      </Typography>
    }
    sx={{ paddingBottom: 0 }}
  />
  <CardContent sx={{ height: 400, paddingTop: 0 }}>
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <Tree
        data={data}
        translate={{
          x: dimensions.width / 2,
          y: 50,
        }}
        orientation="vertical"
        pathFunc="diagonal"
        collapsible={true}
        zoomable={true}
      />
    </div>
  </CardContent>
</Card>

  );
};

export default GENAITree;
