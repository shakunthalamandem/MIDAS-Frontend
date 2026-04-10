import React, { useState } from "react";
import { Box, Paper } from "@mui/material";
import { motion } from "framer-motion";
import { ComputedField } from "./types";
import { useTableData } from "./hooks/useTableData";
import HeaderSection from "./components/HeaderSection";
import TableSelectorBar from "./components/TableSelectorBar";
import ColumnPickerPanel from "./components/ColumnPickerPanel";
import FilterPanel from "./components/FilterPanel";
import DataGridSection from "./components/DataGridSection";
import QueryPreviewModal from "./components/QueryPreviewModal";
import FormulaBar from "./components/FormulaBar";
import ColumnStatsPanel from "./ColumnStatsPanel";

const MotionBox = motion(Box);

const DatabaseExplorer: React.FC = () => {
  // --- Data state (from custom hook) ---
  const {
    tables,
    tablesLoading,
    selectedTable,
    setSelectedTable,
    columns,
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
    queryData,
    exportExcel,
    addFilter,
    updateFilter,
    removeFilter,
    clearFilters,
  } = useTableData();

  // --- UI state ---
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statsColumn, setStatsColumn] = useState<string | null>(null);
  const [queryPreviewOpen, setQueryPreviewOpen] = useState(false);
  const [computedFields, setComputedFields] = useState<ComputedField[]>([]);

  const activeFilters = filters.filter((f) => f.column);
  const selectedTableInfo = tables.find(
    (t) => t.table_name === selectedTable
  );

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <HeaderSection
        tables={tables}
        selectedTable={selectedTable}
        columns={columns}
        activeFilterCount={activeFilters.length}
      />

      {/* Main Content */}
      <MotionBox
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        sx={{ maxWidth: 1600, mx: "auto", px: { xs: 2, md: 4 }, py: 3 }}
      >
        {/* Controls Card */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            mb: 2.5,
            transition: "box-shadow 0.2s",
            "&:hover": {
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
            },
          }}
        >
          <TableSelectorBar
            tables={tables}
            tablesLoading={tablesLoading}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTable}
            selectedColumnsCount={selectedColumns.length}
            totalColumnsCount={columns.length}
            showColumnPanel={showColumnPanel}
            onToggleColumnPanel={() => setShowColumnPanel(!showColumnPanel)}
            activeFilterCount={activeFilters.length}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onAddFilter={addFilter}
            filtersCount={filters.length}
            queryLoading={queryLoading}
            onRunQuery={() => queryData(0)}
            exportLoading={exportLoading}
            rowsCount={rows.length}
            onExport={exportExcel}
            onGenerateQuery={() => setQueryPreviewOpen(true)}
          />

          <ColumnPickerPanel
            open={showColumnPanel && selectedTable !== ""}
            columns={columns}
            selectedColumns={selectedColumns}
            onToggle={(colName) =>
              setSelectedColumns((prev) =>
                prev.includes(colName)
                  ? prev.filter((c) => c !== colName)
                  : [...prev, colName]
              )
            }
            onSelectAll={() =>
              setSelectedColumns(columns.map((c) => c.name))
            }
            onClear={() => setSelectedColumns([])}
          />

          <FilterPanel
            open={showFilters && selectedTable !== ""}
            columns={columns}
            filters={filters}
            onUpdate={updateFilter}
            onRemove={removeFilter}
            onAdd={addFilter}
            onClear={clearFilters}
          />
        </Paper>

        {/* Formula Bar */}
        {selectedTable && rows.length > 0 && (
          <FormulaBar
            columns={columns}
            rows={rows}
            computedFields={computedFields}
            setComputedFields={setComputedFields}
            pageSize={pageSize}
          />
        )}

        {/* Data Grid + Stats Panel */}
        <Box sx={{ display: "flex", gap: 2.5 }}>
          <DataGridSection
            selectedTable={selectedTable}
            selectedTableInfo={selectedTableInfo}
            columns={columns}
            rows={rows}
            totalRows={totalRows}
            page={page}
            pageSize={pageSize}
            sortModel={sortModel}
            queryLoading={queryLoading}
            statsColumn={statsColumn}
            onSetPage={setPage}
            onSetPageSize={setPageSize}
            onSetSortModel={setSortModel}
            onQueryData={queryData}
            onSetStatsColumn={setStatsColumn}
          />

          {/* Stats Side Panel */}
          {statsColumn && selectedTable && (
            <ColumnStatsPanel
              table={selectedTable}
              column={statsColumn}
              onClose={() => setStatsColumn(null)}
            />
          )}
        </Box>
      </MotionBox>

      {/* Query Preview Modal */}
      <QueryPreviewModal
        open={queryPreviewOpen}
        onClose={() => setQueryPreviewOpen(false)}
        table={selectedTable}
        columns={selectedColumns}
        filters={filters}
      />
    </Box>
  );
};

export default DatabaseExplorer;
