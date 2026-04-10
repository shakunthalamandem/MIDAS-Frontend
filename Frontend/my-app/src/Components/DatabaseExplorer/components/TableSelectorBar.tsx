import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Autocomplete,
  Badge,
  CircularProgress,
  InputAdornment,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CodeIcon from "@mui/icons-material/Code";
import { TableInfo, FilterRule } from "../types";
import { formatTableName } from "../utils";

const MotionButton = motion(Button);

interface TableSelectorBarProps {
  tables: TableInfo[];
  tablesLoading: boolean;
  selectedTable: string;
  onSelectTable: (table: string) => void;
  selectedColumnsCount: number;
  totalColumnsCount: number;
  showColumnPanel: boolean;
  onToggleColumnPanel: () => void;
  activeFilterCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  onAddFilter: () => void;
  filtersCount: number;
  queryLoading: boolean;
  onRunQuery: () => void;
  exportLoading: boolean;
  rowsCount: number;
  onExport: () => void;
  onGenerateQuery: () => void;
}

const TableSelectorBar: React.FC<TableSelectorBarProps> = ({
  tables,
  tablesLoading,
  selectedTable,
  onSelectTable,
  selectedColumnsCount,
  totalColumnsCount,
  showColumnPanel,
  onToggleColumnPanel,
  activeFilterCount,
  showFilters,
  onToggleFilters,
  onAddFilter,
  filtersCount,
  queryLoading,
  onRunQuery,
  exportLoading,
  rowsCount,
  onExport,
  onGenerateQuery,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      {/* Table Selector */}
      <Autocomplete
        value={tables.find((t) => t.table_name === selectedTable) || null}
        onChange={(_, val) => onSelectTable(val?.table_name || "")}
        options={tables}
        getOptionLabel={(opt) => formatTableName(opt.table_name)}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              "&:hover": { bgcolor: "#f0f7ff !important" },
            }}
          >
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
              {formatTableName(option.table_name)}
            </Typography>
            <Chip
              label={`~${option.approx_rows.toLocaleString()}`}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                bgcolor: "#eff6ff",
                color: "#3b82f6",
                fontWeight: 600,
              }}
            />
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
        <MotionButton
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          variant="outlined"
          startIcon={<ViewColumnIcon />}
          onClick={onToggleColumnPanel}
          sx={{
            borderColor: showColumnPanel ? "#3b82f6" : "#e2e8f0",
            color: showColumnPanel ? "#3b82f6" : "#475569",
            bgcolor: showColumnPanel ? "#eff6ff" : "transparent",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.78rem",
            borderRadius: 2,
            "&:hover": { borderColor: "#3b82f6", color: "#3b82f6" },
          }}
        >
          Columns{" "}
          {selectedColumnsCount > 0
            ? `(${selectedColumnsCount}/${totalColumnsCount})`
            : "(All)"}
        </MotionButton>
      )}

      {/* Filter Button */}
      {selectedTable && (
        <Badge
          badgeContent={activeFilterCount}
          color="primary"
          sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem" } }}
        >
          <MotionButton
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => {
              onToggleFilters();
              if (filtersCount === 0) onAddFilter();
            }}
            sx={{
              borderColor: activeFilterCount > 0 ? "#3b82f6" : "#e2e8f0",
              color: activeFilterCount > 0 ? "#3b82f6" : "#475569",
              bgcolor: activeFilterCount > 0 ? "#eff6ff" : "transparent",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.78rem",
              borderRadius: 2,
              "&:hover": { borderColor: "#3b82f6", color: "#3b82f6" },
            }}
          >
            Filters
          </MotionButton>
        </Badge>
      )}

      {/* Generate Query Button */}
      {selectedTable && (
        <MotionButton
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          variant="outlined"
          startIcon={<CodeIcon />}
          onClick={onGenerateQuery}
          sx={{
            borderColor: "#8b5cf6",
            color: "#8b5cf6",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.78rem",
            borderRadius: 2,
            "&:hover": {
              borderColor: "#7c3aed",
              color: "#7c3aed",
              bgcolor: "#f5f3ff",
            },
          }}
        >
          Generate Query
        </MotionButton>
      )}

      <Box sx={{ flex: 1 }} />

      {/* Action Buttons */}
      {selectedTable && (
        <Box sx={{ display: "flex", gap: 1 }}>
          <MotionButton
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            variant="contained"
            onClick={onRunQuery}
            disabled={queryLoading}
            startIcon={
              queryLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <RefreshIcon />
              )
            }
            sx={{
              bgcolor: "#3b82f6",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.8rem",
              px: 3,
              borderRadius: 2,
              boxShadow: "0 2px 12px rgba(59,130,246,0.35)",
              "&:hover": { bgcolor: "#2563eb" },
            }}
          >
            Run Query
          </MotionButton>
          <MotionButton
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            variant="outlined"
            onClick={onExport}
            disabled={exportLoading || rowsCount === 0}
            startIcon={
              exportLoading ? <CircularProgress size={16} /> : <FileDownloadIcon />
            }
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
          </MotionButton>
        </Box>
      )}
    </Box>
  );
};

export default TableSelectorBar;
