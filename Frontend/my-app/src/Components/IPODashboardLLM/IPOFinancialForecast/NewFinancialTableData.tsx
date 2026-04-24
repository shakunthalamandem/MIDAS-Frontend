import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  TextField,
  Button,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

import { priorityOrder } from "./utils/financialHelpers";
import {
  formatFinancialValue,
  formatFinancialMargin,
} from "./utils/financialFormatters";

export interface TableSnapshot {
  columns: string[];
  rows: string[];
  values: Record<string, Record<string, any>>;
}

interface NewFinancialTableDataProps {
  initialData: any;
  saving?: boolean;
  onSave: (meta: any) => void;
}

const INTERNAL_KEYS = new Set([
  "__columns",
  "__rows",
  "metric_name",
  "ticker_name",
]);

export const metaDataToSnapshot = (meta: any): TableSnapshot => {
  const safe = meta && typeof meta === "object" ? meta : {};
  const explicitCols: string[] | null = Array.isArray(safe.__columns)
    ? (safe.__columns as string[])
    : null;
  const explicitRows: string[] | null = Array.isArray(safe.__rows)
    ? (safe.__rows as string[])
    : null;

  const inferredCols = Object.keys(safe).filter(
    (k) => !INTERNAL_KEYS.has(k) && safe[k] && typeof safe[k] === "object",
  );

  let columns: string[];
  if (explicitCols && explicitCols.length) {
    const explicitSet = new Set(explicitCols);
    const extra = inferredCols.filter((c) => !explicitSet.has(c));
    columns = [...explicitCols, ...extra];
  } else {
    columns = inferredCols;
  }

  const allRows = new Set<string>();
  for (const c of columns) {
    const colData = safe[c];
    if (colData && typeof colData === "object") {
      for (const r of Object.keys(colData)) allRows.add(r);
    }
  }

  let rows: string[];
  if (explicitRows && explicitRows.length) {
    const explicitSet = new Set(explicitRows);
    const kept = explicitRows.filter((r) => allRows.has(r) || true);
    const extra = Array.from(allRows).filter((r) => !explicitSet.has(r));
    rows = [...kept, ...extra];
  } else {
    const ordered: string[] = [];
    const remaining = new Set(allRows);
    for (const name of priorityOrder) {
      if (remaining.has(name)) {
        ordered.push(name);
        remaining.delete(name);
      }
    }
    const rest = Array.from(remaining);
    rest.sort();
    ordered.push(...rest);
    rows = ordered;
  }

  const values: Record<string, Record<string, any>> = {};
  for (const c of columns) {
    values[c] = {};
    for (const r of rows) {
      const cell = safe[c]?.[r];
      values[c][r] = cell === undefined ? null : cell;
    }
  }
  return { columns, rows, values };
};

export const snapshotToMetaData = (snap: TableSnapshot): any => {
  const meta: any = {
    __columns: [...snap.columns],
    __rows: [...snap.rows],
  };
  for (const c of snap.columns) {
    meta[c] = {};
    for (const r of snap.rows) {
      const v = snap.values[c]?.[r];
      meta[c][r] = v === undefined ? null : v;
    }
  }
  return meta;
};

const formatLabel = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const NewFinancialTableData: React.FC<NewFinancialTableDataProps> = ({
  initialData,
  saving = false,
  onSave,
}) => {
  const [editing, setEditing] = useState(false);
  const [snapshot, setSnapshot] = useState<TableSnapshot>(() =>
    metaDataToSnapshot(initialData),
  );

  // Drag-and-drop state
  const dragColRef = useRef<number | null>(null);
  const dragRowRef = useRef<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<number | null>(null);
  const [dragOverRow, setDragOverRow] = useState<number | null>(null);

  useEffect(() => {
    if (!editing) {
      setSnapshot(metaDataToSnapshot(initialData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleEdit = () => {
    setSnapshot(metaDataToSnapshot(initialData));
    setEditing(true);
  };

  const handleCancel = () => {
    setSnapshot(metaDataToSnapshot(initialData));
    setEditing(false);
  };

  const handleSaveClick = () => {
    onSave(snapshotToMetaData(snapshot));
    setEditing(false);
  };

  const updateCell = (col: string, row: string, val: string) => {
    setSnapshot((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [col]: {
          ...(prev.values[col] || {}),
          [row]: val === "" ? null : val,
        },
      },
    }));
  };

  const renameColumn = (oldName: string, newName: string) => {
    const trimmed = (newName || "").trim();
    if (!trimmed || oldName === trimmed) return;
    setSnapshot((prev) => {
      if (prev.columns.includes(trimmed)) return prev;
      const columns = prev.columns.map((c) => (c === oldName ? trimmed : c));
      const values: Record<string, Record<string, any>> = {};
      for (const c of columns) {
        if (c === trimmed) values[trimmed] = prev.values[oldName] || {};
        else values[c] = prev.values[c] || {};
      }
      return { ...prev, columns, values };
    });
  };

  const renameRow = (oldName: string, newName: string) => {
    const trimmed = (newName || "").trim();
    if (!trimmed || oldName === trimmed) return;
    setSnapshot((prev) => {
      if (prev.rows.includes(trimmed)) return prev;
      const rows = prev.rows.map((r) => (r === oldName ? trimmed : r));
      const values: Record<string, Record<string, any>> = {};
      for (const c of prev.columns) {
        const colVals = { ...(prev.values[c] || {}) };
        if (oldName in colVals) {
          colVals[trimmed] = colVals[oldName];
          delete colVals[oldName];
        }
        values[c] = colVals;
      }
      return { ...prev, rows, values };
    });
  };

  const addColumn = () => {
    setSnapshot((prev) => {
      let i = prev.columns.length + 1;
      let name = `New Column ${i}`;
      while (prev.columns.includes(name)) {
        i += 1;
        name = `New Column ${i}`;
      }
      const columns = [...prev.columns, name];
      const colData: Record<string, any> = {};
      for (const r of prev.rows) colData[r] = null;
      return {
        ...prev,
        columns,
        values: { ...prev.values, [name]: colData },
      };
    });
  };

  const addRow = () => {
    setSnapshot((prev) => {
      let i = prev.rows.length + 1;
      let name = `New Metric ${i}`;
      while (prev.rows.includes(name)) {
        i += 1;
        name = `New Metric ${i}`;
      }
      const rows = [...prev.rows, name];
      const values: Record<string, Record<string, any>> = {};
      for (const c of prev.columns) {
        values[c] = { ...(prev.values[c] || {}), [name]: null };
      }
      return { ...prev, rows, values };
    });
  };

  const deleteColumn = (col: string) => {
    setSnapshot((prev) => {
      const columns = prev.columns.filter((c) => c !== col);
      const values: Record<string, Record<string, any>> = { ...prev.values };
      delete values[col];
      return { ...prev, columns, values };
    });
  };

  const deleteRow = (row: string) => {
    setSnapshot((prev) => {
      const rows = prev.rows.filter((r) => r !== row);
      const values: Record<string, Record<string, any>> = {};
      for (const c of prev.columns) {
        const colVals = { ...(prev.values[c] || {}) };
        delete colVals[row];
        values[c] = colVals;
      }
      return { ...prev, rows, values };
    });
  };

  // Column drag handlers
  const handleColDragStart = (index: number) => {
    dragColRef.current = index;
  };
  const handleColDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverCol(index);
  };
  const handleColDrop = (toIndex: number) => {
    const fromIndex = dragColRef.current;
    if (fromIndex === null || fromIndex === toIndex) {
      setDragOverCol(null);
      return;
    }
    setSnapshot((prev) => {
      const columns = [...prev.columns];
      const [moved] = columns.splice(fromIndex, 1);
      columns.splice(toIndex, 0, moved);
      return { ...prev, columns };
    });
    dragColRef.current = null;
    setDragOverCol(null);
  };
  const handleColDragEnd = () => {
    dragColRef.current = null;
    setDragOverCol(null);
  };

  // Row drag handlers
  const handleRowDragStart = (index: number) => {
    dragRowRef.current = index;
  };
  const handleRowDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverRow(index);
  };
  const handleRowDrop = (toIndex: number) => {
    const fromIndex = dragRowRef.current;
    if (fromIndex === null || fromIndex === toIndex) {
      setDragOverRow(null);
      return;
    }
    setSnapshot((prev) => {
      const rows = [...prev.rows];
      const [moved] = rows.splice(fromIndex, 1);
      rows.splice(toIndex, 0, moved);
      return { ...prev, rows };
    });
    dragRowRef.current = null;
    setDragOverRow(null);
  };
  const handleRowDragEnd = () => {
    dragRowRef.current = null;
    setDragOverRow(null);
  };

  const { columns, rows, values } = snapshot;

  return (
    <Box sx={{ position: "relative" }}>
      <Typography
        sx={{
          position: "absolute",
          top: -20,
          right: 0,
          fontSize: "0.8rem",
          color: "grey.600",
          fontStyle: "italic",
        }}
      >
        (Values are in Millions)
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 1,
          mb: 1,
          flexWrap: "wrap",
        }}
      >
        {editing ? (
          <>
            <Tooltip title="Add new row">
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={addRow}
                disabled={saving}
              >
                Row
              </Button>
            </Tooltip>
            <Tooltip title="Add new column">
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={addColumn}
                disabled={saving}
              >
                Column
              </Button>
            </Tooltip>
            <Button
              variant="contained"
              size="small"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveClick}
              disabled={saving}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit Table
          </Button>
        )}
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          boxShadow: "none",
          border: "none",
          backgroundColor: "transparent",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontSize: "1rem",
                  fontWeight: "bold",
                  color: "#0f172a",
                  backgroundColor: "#cfd6ff",
                  borderBottom: "1px solid #e3e7f3",
                  textAlign: "left",
                  minWidth: 200,
                }}
              >
                Metric Name
              </TableCell>
              {columns.map((col, colIndex) => (
                <TableCell
                  key={col}
                  draggable={editing}
                  onDragStart={() => handleColDragStart(colIndex)}
                  onDragOver={(e) => handleColDragOver(e, colIndex)}
                  onDrop={() => handleColDrop(colIndex)}
                  onDragEnd={handleColDragEnd}
                  sx={{
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    color: "#0f172a",
                    borderBottom: "1px solid #e3e7f3",
                    textAlign: "center",
                    backgroundColor:
                      dragOverCol === colIndex && editing
                        ? "#b6c0f5"
                        : "#cfd6ff",
                    cursor: editing ? "grab" : "default",
                    opacity:
                      dragColRef.current === colIndex ? 0.4 : 1,
                    transition: "background-color 0.15s, opacity 0.15s",
                    borderLeft:
                      dragOverCol === colIndex && editing
                        ? "2px solid #3f51b5"
                        : undefined,
                  }}
                >
                  {editing ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.5,
                      }}
                    >
                      <DragIndicatorIcon
                        sx={{
                          fontSize: 16,
                          color: "#7986cb",
                          cursor: "grab",
                          flexShrink: 0,
                        }}
                      />
                      <TextField
                        variant="standard"
                        size="small"
                        defaultValue={col}
                        key={`col-${col}`}
                        onBlur={(e) => renameColumn(col, e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        inputProps={{
                          style: {
                            fontSize: "0.9rem",
                            fontWeight: "bold",
                            textAlign: "center",
                          },
                        }}
                        sx={{ width: "100%" }}
                      />
                      <Tooltip title="Delete column">
                        <IconButton
                          size="small"
                          onClick={() => deleteColumn(col)}
                          sx={{ color: "#b91c1c" }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : (
                    formatLabel(col)
                  )}
                </TableCell>
              ))}
              {editing && (
                <TableCell
                  sx={{
                    backgroundColor: "#cfd6ff",
                    borderBottom: "1px solid #e3e7f3",
                    width: 48,
                  }}
                />
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((rowName, rowIndex) => {
              const isOddRow = rowIndex % 2 === 1;
              const renderAsPercent =
                rowName.toLowerCase().includes("margin") ||
                rowName.toLowerCase().includes("growth");

              return (
                <TableRow
                  key={rowName}
                  sx={{
                    opacity: dragRowRef.current === rowIndex ? 0.4 : 1,
                    borderTop:
                      dragOverRow === rowIndex && editing
                        ? "2px solid #3f51b5"
                        : undefined,
                    transition: "opacity 0.15s",
                  }}
                >
                  <TableCell
                    draggable={editing}
                    onDragStart={() => handleRowDragStart(rowIndex)}
                    onDragOver={(e) => handleRowDragOver(e, rowIndex)}
                    onDrop={() => handleRowDrop(rowIndex)}
                    onDragEnd={handleRowDragEnd}
                    sx={{
                      borderBottom: "1px solid #e3e7f3",
                      fontWeight: "bold",
                      fontStyle: isOddRow ? "italic" : "normal",
                      fontSize: isOddRow ? "1rem" : "1.3rem",
                      backgroundColor:
                        dragOverRow === rowIndex && editing
                          ? "#eef0fb"
                          : "transparent",
                      cursor: editing ? "grab" : "default",
                      transition: "background-color 0.15s",
                    }}
                  >
                    {editing ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <DragIndicatorIcon
                          sx={{
                            fontSize: 16,
                            color: "#7986cb",
                            cursor: "grab",
                            flexShrink: 0,
                          }}
                        />
                        <TextField
                          variant="standard"
                          size="small"
                          defaultValue={rowName}
                          key={`row-${rowName}`}
                          onBlur={(e) => renameRow(rowName, e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                          inputProps={{
                            style: {
                              fontSize: isOddRow ? "1rem" : "1.1rem",
                              fontWeight: "bold",
                              fontStyle: isOddRow ? "italic" : "normal",
                            },
                          }}
                          sx={{ width: "100%" }}
                        />
                      </Box>
                    ) : (
                      formatLabel(rowName)
                    )}
                  </TableCell>

                  {columns.map((col) => {
                    const raw = values[col]?.[rowName];
                    if (editing) {
                      return (
                        <TableCell
                          key={col}
                          align="center"
                          sx={{
                            borderBottom: "1px solid #e3e7f3",
                            fontStyle: isOddRow ? "italic" : "normal",
                            fontSize: isOddRow ? "1.1rem" : "1.3rem",
                            backgroundColor: "#f6f7fb",
                          }}
                        >
                          <TextField
                            variant="outlined"
                            size="small"
                            value={raw ?? ""}
                            onChange={(e) =>
                              updateCell(col, rowName, e.target.value)
                            }
                            inputProps={{
                              style: {
                                fontSize: "1rem",
                                textAlign: "center",
                                padding: "6px 8px",
                              },
                            }}
                            sx={{
                              width: "100%",
                              "& .MuiOutlinedInput-root": { padding: 0 },
                              "& .MuiInputBase-input": { height: "1.5rem" },
                            }}
                          />
                        </TableCell>
                      );
                    }
                    const formatter = renderAsPercent
                      ? formatFinancialMargin
                      : formatFinancialValue;
                    return (
                      <TableCell
                        key={col}
                        align="center"
                        sx={{
                          borderBottom: "1px solid #e3e7f3",
                          fontStyle: isOddRow ? "italic" : "normal",
                          fontSize: isOddRow ? "1.1rem" : "1.3rem",
                          color: "#000000",
                        }}
                      >
                        {formatter(raw)}
                      </TableCell>
                    );
                  })}

                  {editing && (
                    <TableCell
                      sx={{
                        borderBottom: "1px solid #e3e7f3",
                        width: 48,
                        textAlign: "center",
                      }}
                    >
                      <Tooltip title="Delete row">
                        <IconButton
                          size="small"
                          onClick={() => deleteRow(rowName)}
                          sx={{ color: "#b91c1c" }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}

            {editing && rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 2}
                  sx={{
                    textAlign: "center",
                    color: "grey.600",
                    fontStyle: "italic",
                    py: 3,
                  }}
                >
                  No rows yet. Click "Row" to add one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default NewFinancialTableData;
