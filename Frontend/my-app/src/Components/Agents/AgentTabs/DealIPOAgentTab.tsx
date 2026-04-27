import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import GENAIRenderer from "../../GhcAi/AIPages/GENAIRenderer";
import { Block } from "../../GhcAi/Utils/ComponentsUtils";

interface DealIPOAgentTabProps {
  ticker?: string;
}

const parseLooseJson = (value: string): any | null => {
  try {
    return JSON.parse(value);
  } catch {
    try {
      const fn = new Function(`return ${value};`);
      return fn();
    } catch {
      return null;
    }
  }
};

const normalizeBlocks = (val: any): Block[] => {
  if (Array.isArray(val)) return val as Block[];
  if (val && typeof val === "object") {
    if (Array.isArray((val as any).answer)) return (val as any).answer as Block[];
    if (Array.isArray((val as any).blocks)) return (val as any).blocks as Block[];
    if (Array.isArray((val as any).data)) return (val as any).data as Block[];
    if (Array.isArray((val as any).review)) return (val as any).review as Block[];
  }
  if (typeof val === "string" && val.trim()) {
    const parsed = parseLooseJson(val.trim());
    if (parsed) return normalizeBlocks(parsed);
    return [{ type: "text", content: val.trim() } as Block];
  }
  return [];
};

const DealIPOAgentTab: React.FC<DealIPOAgentTabProps> = ({ ticker }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDealIPOData = async () => {
      if (!ticker) return;

      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("access_token");
        const today = new Date().toISOString().split("T")[0].replace(/-/g, "");

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/get_few_shot_review/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({
              ticker: ticker.trim(),
              unique_deal_id: `${ticker.trim()} ${today}`,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const parsedBlocks = normalizeBlocks(data);
        setBlocks(parsedBlocks);
      } catch (err: any) {
        console.error("Error fetching deal IPO data:", err);
        setError(err.message || "Failed to load deal IPO analysis");
      } finally {
        setLoading(false);
      }
    };

    fetchDealIPOData();
  }, [ticker]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <GENAIRenderer blocks={blocks} renderAll={true} disableMotion={true} />
    </Box>
  );
};

export default DealIPOAgentTab;
