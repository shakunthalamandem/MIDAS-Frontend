// DealsPredictionsTable.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, CircularProgress } from "@mui/material";

import DealDetailsPanel from "./DealDetailsPanel";
import DealPricesChart from "./DealPricesChart";
import DealsTable from "./DealsTable";
import DealsPredictionsHeader from "./DealsPredictionsHeader";

import { DealRecord, DealTypeFilter, SortConfig, TickerSelectionPayload } from "./types";

const getISODate = (offsetDays: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  return date.toISOString().split("T")[0];
};

interface DealsPredictionsTableProps {
  onTickerClick?: (payload: TickerSelectionPayload) => void;
}

const DealsPredictionsTable: React.FC<DealsPredictionsTableProps> = ({ onTickerClick }) => {
  const [data, setData] = useState<DealRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [startDate, setStartDate] = useState(getISODate(30));
  const [endDate, setEndDate] = useState(getISODate(0));

  const [selectedDeal, setSelectedDeal] = useState<DealRecord | null>(null);

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "trade_date",
    direction: "desc",
  });

  const [dealTypeFilter, setDealTypeFilter] = useState<DealTypeFilter>("FO");

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  // debounce search for API payload
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        setError(null);

        const payload = {
          ticker: debouncedSearch.trim() || null,
          start_date: startDate || null,
          end_date: endDate || null,
        };

        const res = await fetch(`${apiUrl}/api/ai_ml_results/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch deals");
      } finally {
        setLoading(false);
      }
    };

    if (!apiUrl) {
      setError("Missing REACT_APP_API_URL");
      return;
    }

    fetchDeals();
  }, [apiUrl, token, debouncedSearch, startDate, endDate]);

  // client-side filter (search + date + deal type)
  const filteredData = useMemo(() => {
    let rows = data;

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((row) => {
        const tickerMatch = row.ticker?.toLowerCase().includes(q);
        const issuerMatch = row.issuer_name?.toLowerCase().includes(q);
        return tickerMatch || issuerMatch;
      });
    }

    if (startDate || endDate) {
      const startTime = startDate ? Date.parse(startDate) : null;
      const endTime = endDate ? Date.parse(endDate) : null;

      rows = rows.filter((row) => {
        const rowTime = row.trade_date ? Date.parse(row.trade_date) : null;
        if (rowTime === null || Number.isNaN(rowTime)) return false;
        if (startTime && rowTime < startTime) return false;
        if (endTime && rowTime > endTime) return false;
        return true;
      });
    }

    rows = rows.filter((row) => {
      const type = (row.deal_type || "").toUpperCase();
      return type.includes(dealTypeFilter);
    });

    return rows;
  }, [data, search, startDate, endDate, dealTypeFilter]);

  const getComparableValue = (row: DealRecord, key: keyof DealRecord): string | number | null => {
    const value = row[key] as any;
    if (value === null || value === undefined || value === "") return null;

    if (key === "trade_date") {
      const time = new Date(value as string).getTime();
      return Number.isNaN(time) ? null : time;
    }

    if (typeof value === "number") return value;

    if (typeof value === "string") {
      const num = parseFloat(value);
      if (!Number.isNaN(num)) return num;
      return value.toLowerCase();
    }

    return String(value);
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sorted = [...filteredData];
    const { key, direction } = sortConfig;

    sorted.sort((a, b) => {
      const aVal = getComparableValue(a, key);
      const bVal = getComparableValue(b, key);

      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);
      const cmp = aStr.localeCompare(bStr);
      return direction === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  const handleSortChange = (sortKey: string | number | symbol) => {
    const key = sortKey as keyof DealRecord;
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key: key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key: key, direction: "asc" };
    });
  };

  return (
    <Box>
      <DealsPredictionsHeader
        dealTypeFilter={dealTypeFilter}
        onDealTypeChange={setDealTypeFilter}
        search={search}
        onSearchChange={setSearch}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
      />

      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && sortedData.length === 0 && (
        <Alert severity="info">No deals found for the selected criteria.</Alert>
      )}

      {!loading && !error && sortedData.length > 0 && (
        <>
          <DealsTable
            rows={sortedData}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
            selectedDeal={selectedDeal}
            onSelectDeal={setSelectedDeal}
            onTickerClick={onTickerClick}
            dealTypeFilter={dealTypeFilter}
          />

          <Box mt={2}>
            <DealDetailsPanel deal={selectedDeal} />
            <DealPricesChart deal={selectedDeal} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default DealsPredictionsTable;
