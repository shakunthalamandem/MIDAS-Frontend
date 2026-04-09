import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  IconButton,
  TextField,
  Tooltip,
  Paper,
  CircularProgress,
  Autocomplete,
  Checkbox,
  Divider,
  Collapse,
  Badge,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { DataGrid, GridColDef, GridSortModel } from "@mui/x-data-grid";
import StorageIcon from "@mui/icons-material/Storage";
import TableChartIcon from "@mui/icons-material/TableChart";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import BarChartIcon from "@mui/icons-material/BarChart";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import KeyIcon from "@mui/icons-material/Key";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ColumnStatsPanel from "./ColumnStatsPanel";

const API_URL = process.env.REACT_APP_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

interface TableInfo {
  table_name: string;
  approx_rows: number;
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  max_length: number | null;
  precision: number | null;
  is_primary_key: boolean;
}

interface FilterRule {
  id: string;
  column: string;
  operator: string;
  value: string;
}

const OPERATORS = [
  { value: "=", label: "= Equals" },
  { value: "!=", label: "!= Not Equals" },
  { value: ">", label: "> Greater Than" },
  { value: "<", label: "< Less Than" },
  { value: ">=", label: ">= Greater or Equal" },
  { value: "<=", label: "<= Less or Equal" },
  { value: "LIKE", label: "LIKE (Contains)" },
  { value: "ILIKE", label: "ILIKE (Contains, Case-Insensitive)" },
  { value: "IS NULL", label: "IS NULL" },
  { value: "IS NOT NULL", label: "IS NOT NULL" },
  { value: "IN", label: "IN (Comma-Separated)" },
];

const TYPE_COLORS: Record<string, string> = {
  integer: "#7c3aed",
  bigint: "#7c3aed",
  smallint: "#7c3aed",
  numeric: "#7c3aed",
  real: "#7c3aed",
  "double precision": "#7c3aed",
  text: "#059669",
  "character varying": "#059669",
  character: "#059669",
  boolean: "#d97706",
  date: "#0891b2",
  "timestamp without time zone": "#0891b2",
  "timestamp with time zone": "#0891b2",
  jsonb: "#e11d48",
  json: "#e11d48",
  uuid: "#6366f1",
};

const DatabaseExplorer: React.FC = () => {
  // --- State ---
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [tableSearch, setTableSearch] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [columnsLoading, setColumnsLoading] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [queryLoading, setQueryLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [statsColumn, setStatsColumn] = useState<string | null>(null);
  const [showColumnPanel, setShowColumnPanel] = useState(false);

  // --- Fetch tables on mount ---
  const fetchTables = useCallback(async () => {
    setTablesLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/db_explorer_tables/`, { headers: getHeaders() });
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
      const res = await fetch(`${API_URL}/api/db_explorer_columns/?table=${table}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setColumns(data.columns || []);
        setSelectedColumns([]); // reset selection
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
      setStatsColumn(null);
    }
  }, [selectedTable, fetchColumns]);

  // --- Query data ---
  const queryData = useCallback(async (newPage?: number) => {
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
  }, [selectedTable, selectedColumns, filters, page, pageSize, sortModel]);

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
    setFilters([...filters, { id: Date.now().toString(), column: "", operator: "=", value: "" }]);
    setShowFilters(true);
  };
  const updateFilter = (id: string, field: keyof FilterRule, value: string) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  };
  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };
  const clearFilters = () => {
    setFilters([]);
  };

  // --- Build DataGrid columns ---
  const gridColumns: GridColDef[] = (rows.length > 0 ? Object.keys(rows[0]) : []).map((key) => {
    const colInfo = columns.find((c) => c.name === key);
    return {
      field: key,
      headerName: key,
      flex: 1,
      minWidth: 130,
      sortable: true,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {colInfo?.is_primary_key && <KeyIcon sx={{ fontSize: 14, color: "#d97706" }} />}
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700 }}>{key}</Typography>
          {colInfo && (
            <Typography sx={{ fontSize: "0.6rem", color: "#94a3b8", ml: 0.5 }}>
              {colInfo.type}
            </Typography>
          )}
        </Box>
      ),
      renderCell: (params: any) => {
        const val = params.value;
        if (val === null || val === undefined) {
          return <Typography sx={{ fontSize: "0.75rem", color: "#cbd5e1", fontStyle: "italic" }}>NULL</Typography>;
        }
        if (typeof val === "object") {
          return (
            <Tooltip title={JSON.stringify(val, null, 2)} arrow>
              <Typography sx={{ fontSize: "0.75rem", color: "#e11d48", cursor: "pointer" }}>
                {JSON.stringify(val).slice(0, 60)}...
              </Typography>
            </Tooltip>
          );
        }
        const str = String(val);
        return (
          <Tooltip title={str.length > 50 ? str : ""} arrow>
            <Typography sx={{ fontSize: "0.75rem", color: "#1e293b" }}>
              {str.length > 80 ? str.slice(0, 80) + "..." : str}
            </Typography>
          </Tooltip>
        );
      },
    };
  });

  const filteredTables = tables.filter((t) =>
    t.table_name.toLowerCase().includes(tableSearch.toLowerCase())
  );

  const activeFilters = filters.filter((f) => f.column);
  const selectedTableInfo = tables.find((t) => t.table_name === selectedTable);

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* ═══ Header ═══ */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
          px: { xs: 2, md: 4 },
          py: 3,
          color: "#fff",
        }}
      >
        <Box sx={{ maxWidth: 1600, mx: "auto" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <StorageIcon sx={{ fontSize: 24, color: "#fff" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1.3rem", fontWeight: 800, letterSpacing: -0.5 }}>
                Database Explorer
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                Browse tables, filter data, and export to Excel
              </Typography>
            </Box>
          </Box>

          {/* Stats row */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {[
              { label: "Tables", value: tables.length, icon: <TableChartIcon sx={{ fontSize: 16 }} /> },
              ...(selectedTable
                ? [
                    { label: "Columns", value: columns.length, icon: <ViewColumnIcon sx={{ fontSize: 16 }} /> },
                    { label: "Approx Rows", value: selectedTableInfo?.approx_rows?.toLocaleString() || "—", icon: <StorageIcon sx={{ fontSize: 16 }} /> },
                    { label: "Active Filters", value: activeFilters.length, icon: <FilterListIcon sx={{ fontSize: 16 }} /> },
                  ]
                : []),
            ].map((stat, i) => (
              <Box
                key={i}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box sx={{ color: "#60a5fa" }}>{stat.icon}</Box>
                <Box>
                  <Typography sx={{ fontSize: "0.6rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
                    {stat.label}
                  </Typography>
                  <Typography sx={{ fontSize: "0.95rem", fontWeight: 800 }}>{stat.value}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ═══ Main Content ═══ */}
      <Box sx={{ maxWidth: 1600, mx: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
        {/* Table Selector + Controls */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            mb: 2.5,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Table Selector */}
            <Autocomplete
              value={tables.find((t) => t.table_name === selectedTable) || null}
              onChange={(_, val) => setSelectedTable(val?.table_name || "")}
              options={filteredTables}
              getOptionLabel={(opt) => opt.table_name}
              renderOption={(props, option) => (
                <Box component="li" {...props} sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{option.table_name}</Typography>
                  <Chip label={`~${option.approx_rows.toLocaleString()}`} size="small" sx={{ height: 20, fontSize: "0.65rem", bgcolor: "#f1f5f9" }} />
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Table"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              sx={{ minWidth: 340 }}
              loading={tablesLoading}
            />

            {/* Column Picker */}
            {selectedTable && (
              <Button
                variant="outlined"
                startIcon={<ViewColumnIcon />}
                onClick={() => setShowColumnPanel(!showColumnPanel)}
                sx={{
                  borderColor: "#e2e8f0",
                  color: "#475569",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  "&:hover": { borderColor: "#3b82f6", color: "#3b82f6" },
                }}
              >
                Columns {selectedColumns.length > 0 ? `(${selectedColumns.length}/${columns.length})` : `(All)`}
              </Button>
            )}

            {/* Filter Button */}
            {selectedTable && (
              <Badge badgeContent={activeFilters.length} color="primary" sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem" } }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => { setShowFilters(!showFilters); if (filters.length === 0) addFilter(); }}
                  sx={{
                    borderColor: activeFilters.length > 0 ? "#3b82f6" : "#e2e8f0",
                    color: activeFilters.length > 0 ? "#3b82f6" : "#475569",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    "&:hover": { borderColor: "#3b82f6", color: "#3b82f6" },
                  }}
                >
                  Filters
                </Button>
              </Badge>
            )}

            <Box sx={{ flex: 1 }} />

            {/* Action Buttons */}
            {selectedTable && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={() => queryData(0)}
                  disabled={queryLoading}
                  startIcon={queryLoading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                  sx={{
                    bgcolor: "#3b82f6",
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    px: 3,
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
                    "&:hover": { bgcolor: "#2563eb" },
                  }}
                >
                  Run Query
                </Button>
                <Button
                  variant="outlined"
                  onClick={exportExcel}
                  disabled={exportLoading || rows.length === 0}
                  startIcon={exportLoading ? <CircularProgress size={16} /> : <FileDownloadIcon />}
                  sx={{
                    borderColor: "#059669",
                    color: "#059669",
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    borderRadius: 2,
                    "&:hover": { borderColor: "#047857", bgcolor: "#f0fdf4" },
                  }}
                >
                  Export Excel
                </Button>
              </Box>
            )}
          </Box>

          {/* Column Picker Panel */}
          <Collapse in={showColumnPanel && selectedTable !== ""}>
            <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #f1f5f9" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Select Columns
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button size="small" onClick={() => setSelectedColumns(columns.map((c) => c.name))} sx={{ fontSize: "0.7rem", textTransform: "none" }}>
                    Select All
                  </Button>
                  <Button size="small" onClick={() => setSelectedColumns([])} sx={{ fontSize: "0.7rem", textTransform: "none" }}>
                    Clear
                  </Button>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                {columns.map((col) => {
                  const isSelected = selectedColumns.includes(col.name);
                  const typeColor = TYPE_COLORS[col.type] || "#64748b";
                  return (
                    <Chip
                      key={col.name}
                      label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          {col.is_primary_key && <KeyIcon sx={{ fontSize: 11, color: "#d97706" }} />}
                          <span>{col.name}</span>
                          <Typography component="span" sx={{ fontSize: "0.55rem", color: typeColor, ml: 0.3 }}>
                            {col.type}
                          </Typography>
                        </Box>
                      }
                      size="small"
                      onClick={() => {
                        setSelectedColumns(
                          isSelected
                            ? selectedColumns.filter((c) => c !== col.name)
                            : [...selectedColumns, col.name]
                        );
                      }}
                      sx={{
                        height: 28,
                        fontSize: "0.72rem",
                        fontWeight: isSelected ? 700 : 500,
                        bgcolor: isSelected ? "#eff6ff" : "#f8fafc",
                        color: isSelected ? "#1d4ed8" : "#64748b",
                        border: `1px solid ${isSelected ? "#93c5fd" : "#e2e8f0"}`,
                        cursor: "pointer",
                        "&:hover": { borderColor: "#3b82f6", bgcolor: "#eff6ff" },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          </Collapse>

          {/* Filters Panel */}
          <Collapse in={showFilters && selectedTable !== ""}>
            <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #f1f5f9" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Filter Conditions
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button size="small" startIcon={<AddIcon />} onClick={addFilter} sx={{ fontSize: "0.7rem", textTransform: "none" }}>
                    Add Filter
                  </Button>
                  {filters.length > 0 && (
                    <Button size="small" color="error" onClick={clearFilters} sx={{ fontSize: "0.7rem", textTransform: "none" }}>
                      Clear All
                    </Button>
                  )}
                </Box>
              </Box>
              {filters.map((f) => (
                <Box key={f.id} sx={{ display: "flex", gap: 1.5, mb: 1, alignItems: "center" }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel sx={{ fontSize: "0.75rem" }}>Column</InputLabel>
                    <Select
                      value={f.column}
                      onChange={(e) => updateFilter(f.id, "column", e.target.value)}
                      label="Column"
                      sx={{ fontSize: "0.78rem" }}
                    >
                      {columns.map((col) => (
                        <MenuItem key={col.name} value={col.name} sx={{ fontSize: "0.78rem" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {col.is_primary_key && <KeyIcon sx={{ fontSize: 12, color: "#d97706" }} />}
                            {col.name}
                            <Typography sx={{ fontSize: "0.6rem", color: TYPE_COLORS[col.type] || "#94a3b8" }}>
                              {col.type}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel sx={{ fontSize: "0.75rem" }}>Operator</InputLabel>
                    <Select
                      value={f.operator}
                      onChange={(e) => updateFilter(f.id, "operator", e.target.value)}
                      label="Operator"
                      sx={{ fontSize: "0.78rem" }}
                    >
                      {OPERATORS.map((op) => (
                        <MenuItem key={op.value} value={op.value} sx={{ fontSize: "0.78rem" }}>
                          {op.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {!["IS NULL", "IS NOT NULL"].includes(f.operator) && (
                    <TextField
                      size="small"
                      placeholder="Value..."
                      value={f.value}
                      onChange={(e) => updateFilter(f.id, "value", e.target.value)}
                      sx={{ minWidth: 200, "& input": { fontSize: "0.78rem" } }}
                    />
                  )}
                  <IconButton size="small" onClick={() => removeFilter(f.id)} sx={{ color: "#ef4444" }}>
                    <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Paper>

        {/* Data Grid + Stats Panel */}
        <Box sx={{ display: "flex", gap: 2.5 }}>
          {/* Main Data Grid */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              minHeight: 500,
            }}
          >
            {!selectedTable ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 12, color: "#94a3b8" }}>
                <StorageIcon sx={{ fontSize: 64, mb: 2, color: "#cbd5e1" }} />
                <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#475569", mb: 0.5 }}>
                  Select a Table to Begin
                </Typography>
                <Typography sx={{ fontSize: "0.8rem" }}>
                  Choose a table from the dropdown above to explore its data
                </Typography>
              </Box>
            ) : rows.length === 0 && !queryLoading ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 12, color: "#94a3b8" }}>
                <TableChartIcon sx={{ fontSize: 56, mb: 2, color: "#cbd5e1" }} />
                <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#475569", mb: 0.5 }}>
                  {selectedTable}
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", mb: 2 }}>
                  {columns.length} columns | ~{selectedTableInfo?.approx_rows?.toLocaleString()} rows
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => queryData(0)}
                  startIcon={<RefreshIcon />}
                  sx={{
                    bgcolor: "#3b82f6",
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 2,
                    "&:hover": { bgcolor: "#2563eb" },
                  }}
                >
                  Load Data
                </Button>
              </Box>
            ) : (
              <Box sx={{ height: 650 }}>
                <DataGrid
                  rows={rows.map((r, i) => ({ _row_id: i, ...r }))}
                  columns={gridColumns}
                  getRowId={(row) => row._row_id}
                  rowCount={totalRows}
                  paginationMode="server"
                  paginationModel={{ page, pageSize }}
                  onPaginationModelChange={(model) => {
                    setPage(model.page);
                    setPageSize(model.pageSize);
                    queryData(model.page);
                  }}
                  pageSizeOptions={[25, 50, 100, 250, 500]}
                  sortingMode="server"
                  sortModel={sortModel}
                  onSortModelChange={(model) => {
                    setSortModel(model);
                  }}
                  loading={queryLoading}
                  density="compact"
                  disableRowSelectionOnClick
                  onColumnHeaderClick={(params) => {
                    // Right-click for stats could go here
                  }}
                  sx={{
                    border: "none",
                    "& .MuiDataGrid-columnHeaders": {
                      bgcolor: "#f8fafc",
                      borderBottom: "2px solid #e2e8f0",
                    },
                    "& .MuiDataGrid-columnHeaderTitle": {
                      fontWeight: 700,
                      fontSize: "0.72rem",
                    },
                    "& .MuiDataGrid-cell": {
                      borderBottom: "1px solid #f1f5f9",
                      py: 0.5,
                    },
                    "& .MuiDataGrid-row:hover": {
                      bgcolor: "#f0f9ff",
                    },
                    "& .MuiDataGrid-footerContainer": {
                      borderTop: "2px solid #e2e8f0",
                    },
                  }}
                />
              </Box>
            )}

            {/* Quick Column Stats Bar */}
            {selectedTable && columns.length > 0 && rows.length > 0 && (
              <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <BarChartIcon sx={{ fontSize: 16, color: "#64748b" }} />
                  <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", mr: 1 }}>
                    Column Stats:
                  </Typography>
                  {columns.slice(0, 12).map((col) => (
                    <Chip
                      key={col.name}
                      label={col.name}
                      size="small"
                      onClick={() => setStatsColumn(statsColumn === col.name ? null : col.name)}
                      sx={{
                        height: 22,
                        fontSize: "0.65rem",
                        cursor: "pointer",
                        bgcolor: statsColumn === col.name ? "#eff6ff" : "transparent",
                        border: `1px solid ${statsColumn === col.name ? "#3b82f6" : "#e2e8f0"}`,
                        color: statsColumn === col.name ? "#1d4ed8" : "#64748b",
                        fontWeight: statsColumn === col.name ? 700 : 500,
                        "&:hover": { borderColor: "#3b82f6" },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>

          {/* Stats Side Panel */}
          {statsColumn && selectedTable && (
            <ColumnStatsPanel
              table={selectedTable}
              column={statsColumn}
              onClose={() => setStatsColumn(null)}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DatabaseExplorer;
