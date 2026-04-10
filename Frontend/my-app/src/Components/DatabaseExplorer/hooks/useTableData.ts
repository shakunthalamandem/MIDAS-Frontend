import { useState, useEffect, useCallback } from "react";
import { GridSortModel } from "@mui/x-data-grid";
import { TableInfo, ColumnInfo, FilterRule } from "../types";
import { API_URL, getHeaders } from "../utils";

export const useTableData = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [columnsLoading, setColumnsLoading] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [queryLoading, setQueryLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // --- Fetch tables on mount ---
  const fetchTables = useCallback(async () => {
    setTablesLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/db_explorer_tables/`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      }
    } catch (err) {
      console.error("Failed to fetch tables:", err);
    } finally {
      setTablesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // --- Fetch columns when table changes ---
  const fetchColumns = useCallback(async (table: string) => {
    if (!table) return;
    setColumnsLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/db_explorer_columns/?table=${table}`,
        { headers: getHeaders() }
      );
      if (res.ok) {
        const data = await res.json();
        setColumns(data.columns || []);
        setSelectedColumns([]);
      }
    } catch (err) {
      console.error("Failed to fetch columns:", err);
    } finally {
      setColumnsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchColumns(selectedTable);
      setRows([]);
      setTotalRows(0);
      setPage(0);
      setFilters([]);
      setSortModel([]);
    }
  }, [selectedTable, fetchColumns]);

  // --- Query data ---
  const queryData = useCallback(
    async (newPage?: number) => {
      if (!selectedTable) return;
      setQueryLoading(true);
      const currentPage = newPage !== undefined ? newPage : page;
      try {
        const body: any = {
          table: selectedTable,
          columns: selectedColumns,
          filters: filters.filter((f) => f.column),
          page: currentPage + 1,
          page_size: pageSize,
        };
        if (sortModel.length > 0) {
          body.sort_by = sortModel[0].field;
          body.sort_dir = sortModel[0].sort?.toUpperCase() || "ASC";
        }
        const res = await fetch(`${API_URL}/api/db_explorer_query/`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json();
          setRows(data.rows || []);
          setTotalRows(data.total || 0);
        }
      } catch (err) {
        console.error("Query failed:", err);
      } finally {
        setQueryLoading(false);
      }
    },
    [selectedTable, selectedColumns, filters, page, pageSize, sortModel]
  );

  // --- Export to Excel ---
  const exportExcel = async () => {
    if (!selectedTable) return;
    setExportLoading(true);
    try {
      const body: any = {
        table: selectedTable,
        columns: selectedColumns,
        filters: filters.filter((f) => f.column),
        max_rows: 50000,
      };
      if (sortModel.length > 0) {
        body.sort_by = sortModel[0].field;
        body.sort_dir = sortModel[0].sort?.toUpperCase() || "ASC";
      }
      const res = await fetch(`${API_URL}/api/db_explorer_export/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedTable}_export.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExportLoading(false);
    }
  };

  // --- Filter helpers ---
  const addFilter = () => {
    setFilters((prev) => [
      ...prev,
      { id: Date.now().toString(), column: "", operator: "=", value: "" },
    ]);
  };

  const updateFilter = (
    id: string,
    field: keyof FilterRule,
    value: string
  ) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const removeFilter = (id: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const clearFilters = () => {
    setFilters([]);
  };

  return {
    // Data
    tables,
    tablesLoading,
    selectedTable,
    setSelectedTable,
    columns,
    columnsLoading,
    selectedColumns,
    setSelectedColumns,
    filters,
    rows,
    totalRows,
    page,
    setPage,
    pageSize,
    setPageSize,
    sortModel,
    setSortModel,
    queryLoading,
    exportLoading,
    // Actions
    queryData,
    exportExcel,
    addFilter,
    updateFilter,
    removeFilter,
    clearFilters,
  };
};
