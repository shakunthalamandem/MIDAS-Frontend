import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box, CircularProgress } from "@mui/material";
import type { AttributionItem, AttributionGroupBy } from "./types";
import AttributionTable from "./AttributionTable";
import AttributionDetail from "./AttributionDetail";
import AttributionRowCards from "./AttributionRowCards";
import AttributionChart from "./AttributionChart";
import AttributionAreaCharts from "./AttributionAreaCharts";
import "./Attribution.css";
import "./AttributionRowCards.css";

interface AttributionProps {
  selectedFunds: string[];
  selectedDate: string;
}

interface TabTheme {
  key: AttributionGroupBy;
  label: string;
  headerBg: string;
  activeTab: string;
  activeTabHover: string;
  evenRow: string;
  hoverRow: string;
  selectedRow: string;
  pnlColor: string;
  expColor: string;
  toolbarBg: string;
  exportBg: string;
}

const GROUP_BY_TABS: TabTheme[] = [
  {
    key: "analyst",
    label: "Analyst",
    headerBg: "#a8c7fa",
    activeTab: "#1565c0",
    activeTabHover: "#0d47a1",
    evenRow: "#e3f2fd",
    hoverRow: "#bbdefb",
    selectedRow: "#fed7aa",
    pnlColor: "#0d47a1",
    expColor: "#00695c",
    toolbarBg: "#e3f2fd",
    exportBg: "#1565c0",
  },
  {
    key: "sector",
    label: "Sector",
    headerBg: "#80cbc4",
    activeTab: "#00796b",
    activeTabHover: "#004d40",
    evenRow: "#e0f2f1",
    hoverRow: "#b2dfdb",
    selectedRow: "#fed7aa",
    pnlColor: "#00695c",
    expColor: "#e65100",
    toolbarBg: "#e0f2f1",
    exportBg: "#00796b",
  },
  {
    key: "industry",
    label: "Industry",
    headerBg: "#ce93d8",
    activeTab: "#7b1fa2",
    activeTabHover: "#4a148c",
    evenRow: "#f3e5f5",
    hoverRow: "#e1bee7",
    selectedRow: "#fed7aa",
    pnlColor: "#6a1b9a",
    expColor: "#004d40",
    toolbarBg: "#f3e5f5",
    exportBg: "#7b1fa2",
  },
  {
    key: "issuer",
    label: "Issuer",
    headerBg: "#9fa8da",
    activeTab: "#283593",
    activeTabHover: "#1a237e",
    evenRow: "#e8eaf6",
    hoverRow: "#c5cae9",
    selectedRow: "#fed7aa",
    pnlColor: "#1a237e",
    expColor: "#00695c",
    toolbarBg: "#e8eaf6",
    exportBg: "#283593",
  },
];

const apiUrl = process.env.REACT_APP_API_URL;

const Attribution: React.FC<AttributionProps> = ({
  selectedFunds,
  selectedDate,
}) => {
  const [groupBy, setGroupBy] = useState<AttributionGroupBy>("analyst");
  const [data, setData] = useState<AttributionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPct, setShowPct] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const activeTheme = GROUP_BY_TABS.find((t) => t.key === groupBy)!;

  const expandedRowData = useMemo(
    () => (expandedRow ? data.find((d) => d.name === expandedRow) ?? null : null),
    [data, expandedRow]
  );

  const fetchAttribution = useCallback(async () => {
    if (selectedFunds.length === 0 || !selectedDate) return;
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
            fund: selectedFunds,
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
  }, [selectedFunds, selectedDate, groupBy]);

  useEffect(() => {
    fetchAttribution();
  }, [fetchAttribution]);

  /* Close detail when tab changes */
  useEffect(() => {
    setExpandedRow(null);
    setSelectedCard(null);
  }, [groupBy]);

  const handleRowClick = (name: string) => {
    setExpandedRow((prev) => {
      if (prev === name) {
        setSelectedCard(null);
        return null;
      }
      setSelectedCard("ytd_pnl");
      return name;
    });
  };

  const handleCardClick = (metricKey: string) => {
    setSelectedCard((prev) => (prev === metricKey ? null : metricKey));
  };

  return (
    <Box className="risk-dashboard-section">
      <Box className="attribution-card">
        {/* Header */}
        <Box className="attribution-header">
          <Box className="attribution-title">ATTRIBUTION</Box>
          <Box className="attribution-toggle">
            <Box
              className={`attribution-toggle-btn${!showPct ? " attribution-toggle-btn--active" : ""}`}
              sx={!showPct ? { background: `${activeTheme.activeTab} !important`, color: "#fff !important" } : {}}
              onClick={() => setShowPct(false)}
            >
              $
            </Box>
            <Box
              className={`attribution-toggle-btn${showPct ? " attribution-toggle-btn--active" : ""}`}
              sx={showPct ? { background: `${activeTheme.activeTab} !important`, color: "#fff !important" } : {}}
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
              sx={
                groupBy === tab.key
                  ? { background: `${tab.activeTab} !important`, color: "#fff !important" }
                  : {}
              }
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
          <>
            <AttributionTable
              data={data}
              showPct={showPct}
              groupBy={groupBy}
              theme={activeTheme}
              selectedFunds={selectedFunds}
              selectedDate={selectedDate}
              expandedRow={expandedRow}
              onRowClick={handleRowClick}
            />

            {/* Area charts - only for analyst and sector group_by */}
            {(groupBy === "analyst" || groupBy === "sector") && (
              <AttributionAreaCharts
                selectedFunds={selectedFunds}
                selectedDate={selectedDate}
                groupBy={groupBy}
                accentColor={activeTheme.activeTab}
              />
            )}

            {/* Metric cards for expanded row */}
            {expandedRow && expandedRowData && (
              <AttributionRowCards
                rowData={expandedRowData}
                selectedCard={selectedCard}
                accentColor={activeTheme.activeTab}
                onCardClick={handleCardClick}
                onClose={() => {
                  setExpandedRow(null);
                  setSelectedCard(null);
                }}
              />
            )}

            {/* Chart for selected card */}
            {expandedRow && selectedCard && (
              <AttributionChart
                selectedFunds={selectedFunds}
                selectedDate={selectedDate}
                groupBy={groupBy}
                groupValue={expandedRow}
                metric={selectedCard}
                accentColor={activeTheme.activeTab}
                currentValue={expandedRowData ? (expandedRowData[selectedCard as keyof AttributionItem] as number) : undefined}
              />
            )}

            {expandedRow && (
              <AttributionDetail
                groupBy={groupBy}
                groupValue={expandedRow}
                selectedFunds={selectedFunds}
                selectedDate={selectedDate}
                showPct={showPct}
                theme={activeTheme}
                onClose={() => {
                  setExpandedRow(null);
                  setSelectedCard(null);
                }}
              />
            )}
          </>
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
