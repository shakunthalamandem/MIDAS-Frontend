import React, { useState, useEffect, useCallback } from "react";
import { Box, CircularProgress } from "@mui/material";
import type { AttributionItem, AttributionGroupBy } from "./types";
import AttributionTable from "./AttributionTable";
import "./Attribution.css";

interface AttributionProps {
  selectedFund: string;
  selectedDate: string;
}

const GROUP_BY_TABS: { key: AttributionGroupBy; label: string }[] = [
  { key: "analyst", label: "Analyst" },
  { key: "sector", label: "Sector" },
  { key: "industry", label: "Industry" },
  { key: "holding_period", label: "Holding Period" },
  { key: "issuer", label: "Issuer" },
];

const apiUrl = process.env.REACT_APP_API_URL;

const Attribution: React.FC<AttributionProps> = ({
  selectedFund,
  selectedDate,
}) => {
  const [groupBy, setGroupBy] = useState<AttributionGroupBy>("sector");
  const [data, setData] = useState<AttributionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPct, setShowPct] = useState(false);

  const fetchAttribution = useCallback(async () => {
    if (!selectedFund || !selectedDate) return;
    const token = localStorage.getItem("access_token");
    setLoading(true);
    try {
      const res = await fetch(
        `${apiUrl}/api/portfolio_attribution_table_data/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: selectedDate,
            fund: selectedFund,
            group_by: groupBy,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to fetch attribution data");
      const result = await res.json();
      setData(result.attribution || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFund, selectedDate, groupBy]);

  useEffect(() => {
    fetchAttribution();
  }, [fetchAttribution]);

  return (
    <Box className="risk-dashboard-section">
      <Box className="attribution-card">
        {/* Header */}
        <Box className="attribution-header">
          <Box className="attribution-title">ATTRIBUTION</Box>
          <Box className="attribution-toggle">
            <Box
              className={`attribution-toggle-btn${!showPct ? " attribution-toggle-btn--active" : ""}`}
              onClick={() => setShowPct(false)}
            >
              $
            </Box>
            <Box
              className={`attribution-toggle-btn${showPct ? " attribution-toggle-btn--active" : ""}`}
              onClick={() => setShowPct(true)}
            >
              % AUM
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box className="attribution-tabs">
          {GROUP_BY_TABS.map((tab) => (
            <Box
              key={tab.key}
              className={`attribution-tab${groupBy === tab.key ? " attribution-tab--active" : ""}`}
              onClick={() => setGroupBy(tab.key)}
            >
              {tab.label}
            </Box>
          ))}
        </Box>

        {/* Content */}
        {loading ? (
          <Box className="attribution-loading">
            <CircularProgress size={32} />
          </Box>
        ) : data.length > 0 ? (
          <AttributionTable data={data} showPct={showPct} groupBy={groupBy} />
        ) : (
          <Box sx={{ textAlign: "center", py: 6, color: "#94a3b8", fontSize: 14 }}>
            No attribution data available
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Attribution;
