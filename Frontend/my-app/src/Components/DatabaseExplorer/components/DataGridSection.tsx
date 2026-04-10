import React from "react";
import { Box, Typography, Button, Paper, Chip, Tooltip } from "@mui/material";
import { DataGrid, GridColDef, GridSortModel } from "@mui/x-data-grid";
import { motion } from "framer-motion";
import StorageIcon from "@mui/icons-material/Storage";
import TableChartIcon from "@mui/icons-material/TableChart";
import RefreshIcon from "@mui/icons-material/Refresh";
import BarChartIcon from "@mui/icons-material/BarChart";
import KeyIcon from "@mui/icons-material/Key";
import { ColumnInfo, TableInfo } from "../types";
import { formatTableName } from "../utils";

const MotionBox = motion(Box);

interface DataGridSectionProps {
  selectedTable: string;
  selectedTableInfo?: TableInfo;
  columns: ColumnInfo[];
  rows: any[];
  totalRows: number;
  page: number;
  pageSize: number;
  sortModel: GridSortModel;
  queryLoading: boolean;
  statsColumn: string | null;
  onSetPage: (p: number) => void;
  onSetPageSize: (ps: number) => void;
  onSetSortModel: (sm: GridSortModel) => void;
  onQueryData: (page?: number) => void;
  onSetStatsColumn: (col: string | null) => void;
}

const DataGridSection: React.FC<DataGridSectionProps> = ({
  selectedTable,
  selectedTableInfo,
  columns,
  rows,
  totalRows,
  page,
  pageSize,
  sortModel,
  queryLoading,
  statsColumn,
  onSetPage,
  onSetPageSize,
  onSetSortModel,
  onQueryData,
  onSetStatsColumn,
}) => {
  // Build DataGrid columns from row keys
  const gridColumns: GridColDef[] = (
    rows.length > 0 ? Object.keys(rows[0]) : []
  ).map((key) => {
    const colInfo = columns.find((c) => c.name === key);
    return {
      field: key,
      headerName: formatTableName(key),
      flex: 1,
      minWidth: 140,
      sortable: true,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {colInfo?.is_primary_key && (
            <KeyIcon sx={{ fontSize: 14, color: "#d97706" }} />
          )}
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#1e293b" }}>
            {formatTableName(key)}
          </Typography>
          {colInfo && (
            <Typography
              sx={{ fontSize: "0.58rem", color: "#94a3b8", ml: 0.3 }}
            >
              {colInfo.type}
            </Typography>
          )}
        </Box>
      ),
      renderCell: (params: any) => {
        const val = params.value;
        if (val === null || val === undefined) {
          return (
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#cbd5e1",
                fontStyle: "italic",
              }}
            >
              NULL
            </Typography>
          );
        }
        if (typeof val === "object") {
          return (
            <Tooltip title={JSON.stringify(val, null, 2)} arrow>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "#e11d48",
                  cursor: "pointer",
                }}
              >
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

  return (
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
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 12,
            color: "#94a3b8",
          }}
        >
          <StorageIcon sx={{ fontSize: 64, mb: 2, color: "#cbd5e1" }} />
          <Typography
            sx={{ fontSize: "1rem", fontWeight: 700, color: "#475569", mb: 0.5 }}
          >
            Select a Table to Begin
          </Typography>
          <Typography sx={{ fontSize: "0.8rem" }}>
            Choose a table from the dropdown above to explore its data
          </Typography>
        </MotionBox>
      ) : rows.length === 0 && !queryLoading ? (
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 12,
            color: "#94a3b8",
          }}
        >
          <TableChartIcon sx={{ fontSize: 56, mb: 2, color: "#cbd5e1" }} />
          <Typography
            sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#475569", mb: 0.5 }}
          >
            {formatTableName(selectedTable)}
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", mb: 2 }}>
            {columns.length} columns | ~
            {selectedTableInfo?.approx_rows?.toLocaleString()} rows
          </Typography>
          <Button
            variant="contained"
            onClick={() => onQueryData(0)}
            startIcon={<RefreshIcon />}
            sx={{
              bgcolor: "#3b82f6",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              boxShadow: "0 2px 12px rgba(59,130,246,0.35)",
              "&:hover": { bgcolor: "#2563eb" },
            }}
          >
            Load Data
          </Button>
        </MotionBox>
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
              onSetPage(model.page);
              onSetPageSize(model.pageSize);
              onQueryData(model.page);
            }}
            pageSizeOptions={[25, 50, 100, 250, 500]}
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={(model) => {
              onSetSortModel(model);
            }}
            loading={queryLoading}
            density="compact"
            disableRowSelectionOnClick
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": {
                background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
                borderBottom: "2px solid #e2e8f0",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 700,
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: 0.3,
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #f1f5f9",
                py: 0.5,
              },
              "& .MuiDataGrid-row:nth-of-type(even)": {
                bgcolor: "#fafbfd",
              },
              "& .MuiDataGrid-row:hover": {
                bgcolor: "#eef5ff",
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "2px solid #e2e8f0",
                bgcolor: "#f8fafc",
              },
            }}
          />
        </Box>
      )}

      {/* Quick Column Stats Bar */}
      {selectedTable && columns.length > 0 && rows.length > 0 && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: "1px solid #e2e8f0",
            bgcolor: "#f8fafc",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <BarChartIcon sx={{ fontSize: 16, color: "#64748b" }} />
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#64748b",
                mr: 1,
              }}
            >
              Column Stats:
            </Typography>
            {columns.slice(0, 12).map((col) => (
              <Chip
                key={col.name}
                label={col.name}
                size="small"
                onClick={() =>
                  onSetStatsColumn(
                    statsColumn === col.name ? null : col.name
                  )
                }
                sx={{
                  height: 22,
                  fontSize: "0.65rem",
                  cursor: "pointer",
                  bgcolor:
                    statsColumn === col.name ? "#eff6ff" : "transparent",
                  border: `1px solid ${
                    statsColumn === col.name ? "#3b82f6" : "#e2e8f0"
                  }`,
                  color: statsColumn === col.name ? "#1d4ed8" : "#64748b",
                  fontWeight: statsColumn === col.name ? 700 : 500,
                  transition: "all 0.15s ease",
                  "&:hover": { borderColor: "#3b82f6" },
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default DataGridSection;
