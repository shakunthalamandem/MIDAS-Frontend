import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { Box, CircularProgress } from "@mui/material";
import type { AttributionItem, AttributionGroupBy } from "./types";
import AttributionTable from "./AttributionTable";

interface TabTheme {
  key: AttributionGroupBy;
  label: string;
  headerBg: string;
  activeTab: string;
  activeTabHover: string;
  evenRow: string;
  hoverRow: string;
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
    pnlColor: "#6a1b9a",
    expColor: "#004d40",
    toolbarBg: "#f3e5f5",
    exportBg: "#7b1fa2",
  },
  {
    key: "holding_period",
    label: "Holding Period",
    headerBg: "#a5d6a7",
    activeTab: "#2e7d32",
    activeTabHover: "#1b5e20",
    evenRow: "#e8f5e9",
    hoverRow: "#c8e6c9",
    pnlColor: "#1b5e20",
    expColor: "#4a148c",
    toolbarBg: "#e8f5e9",
    exportBg: "#2e7d32",
  },
  {
    key: "issuer",
    label: "Issuer",
    headerBg: "#9fa8da",
    activeTab: "#283593",
    activeTabHover: "#1a237e",
    evenRow: "#e8eaf6",
    hoverRow: "#c5cae9",
    pnlColor: "#1a237e",
    expColor: "#00695c",
    toolbarBg: "#e8eaf6",
    exportBg: "#283593",
  },
];

interface AttributionAllTabsProps {
  selectedFunds: string[];
  selectedDate: string;
}

export interface AttributionAllTabsHandle {
  fetchAllData: () => Promise<void>;
}

const apiUrl = process.env.REACT_APP_API_URL;

const AttributionAllTabs = forwardRef<AttributionAllTabsHandle, AttributionAllTabsProps>(
  ({ selectedFunds, selectedDate }, ref) => {
    const [allData, setAllData] = useState<Record<string, AttributionItem[]>>({});
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
      if (selectedFunds.length === 0 || !selectedDate) return;
      const token = localStorage.getItem("access_token");
      setLoading(true);
      try {
        const results = await Promise.all(
          GROUP_BY_TABS.map(async (tab) => {
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
                  group_by: tab.key,
                }),
              }
            );
            if (!res.ok) return { key: tab.key, data: [] };
            const result = await res.json();
            return { key: tab.key, data: result.attribution || [] };
          })
        );
        const dataMap: Record<string, AttributionItem[]> = {};
        results.forEach((r) => {
          dataMap[r.key] = r.data;
        });
        setAllData(dataMap);
      } catch {
        setAllData({});
      } finally {
        setLoading(false);
      }
    }, [selectedFunds, selectedDate]);

    useImperativeHandle(ref, () => ({
      fetchAllData: fetchAll,
    }), [fetchAll]);

    // Also fetch on mount so data is ready
    useEffect(() => {
      fetchAll();
    }, [fetchAll]);

    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      );
    }

    return (
      <>
        {GROUP_BY_TABS.map((tab) => {
          const tabData = allData[tab.key] || [];
          if (tabData.length === 0) return null;
          return (
            <Box key={tab.key} className="pdf-section attribution-pdf-tab">
              <Box className="risk-dashboard-section">
                <Box
                  sx={{
                    fontSize: "13px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: tab.activeTab,
                    mb: 1.5,
                  }}
                >
                  Attribution by {tab.label}
                </Box>
                <AttributionTable
                  data={tabData}
                  showPct={false}
                  groupBy={tab.key}
                  theme={tab}
                />
              </Box>
            </Box>
          );
        })}
      </>
    );
  }
);

export default AttributionAllTabs;
