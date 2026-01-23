import React from "react";
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

import EditableCell from "./EditableCell";
import {
  formatFinancialValue,
  formatFinancialMargin,
} from "./utils/financialFormatters";

interface FONewFinancialTableDataProps {
  data: any;
  editing: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onChange: (metric: string, year: string, val: string) => void;
}

const FONewFinancialTableData: React.FC<FONewFinancialTableDataProps> = ({
  data,
  editing,
  onEdit,
  onSave,
  onCancel,
  onChange,
}) => {
  const columnKeys = Object.keys(data || {}).filter(
    (key) => key !== "metric_name" && key !== "ticker_name"
  );
  const editableColumnKeys = columnKeys;
  const metricList: string[] = [];
  const metricSet = new Set<string>();
  const showEditControls = Boolean(onEdit && onSave && onCancel);

  for (const colKey of columnKeys) {
    const metrics = Object.keys(data?.[colKey] || {});
    for (const metric of metrics) {
      if (!metricSet.has(metric)) {
        metricSet.add(metric);
        metricList.push(metric);
      }
    }
  }

  return (
    <>
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
  <TableContainer component={Paper} elevation={4}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "#FFFFFF",
                backgroundColor: "#002060",
                border: "1px solid #000000",
                textAlign: "center",
              }}
            >
              Metric Name
            </TableCell>
            {columnKeys.map((label) => {
              const isEditableColumn = editableColumnKeys.includes(label);

              return (
                <TableCell
                  key={label}
                  sx={{
                    fontWeight: "bold",
                    color: "#FFFFFF",
                    border: "1px solid #000000",
                    textAlign: "center",
                    backgroundColor: isEditableColumn
                      ? "rgb(95, 82, 30)"
                      : "#002060",
                  }}
                >
                  {label}
                  {isEditableColumn && showEditControls && (
                    <Box component="span" sx={{ ml: 1 }}>
                      {!editing ? (
                        <IconButton onClick={onEdit} size="small" sx={{ color: "#fff" }}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      ) : (
                        <>
                          <IconButton onClick={onSave} size="small" sx={{ color: "#fff" }}>
                            <SaveIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton
                            onClick={onCancel}
                            size="small"
                            sx={{ color: "#fff" }}
                          >
                            <CancelIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>

       <TableBody>
  {metricList.map((metricName: string, rowIndex: number) => {
    const isOddRow = rowIndex % 2 === 1;

    return (
      <TableRow key={metricName}>
        <TableCell
          sx={{
            border: "1px solid #000000",
            fontWeight: "bold",
            fontStyle: isOddRow ? "italic" : "normal",
            fontSize: isOddRow ? "1rem" : "1.3rem",
            backgroundColor: isOddRow ? "" : "#ebebeb",
          }}
        >
          {metricName}
        </TableCell>

        {columnKeys.map((yearKey) => {
          const isEditableCell =
                    editing &&
                    editableColumnKeys.includes(yearKey) 
                    // &&
                    // !isOddRow;
          const isHighlightColumn =
            editableColumnKeys.includes(yearKey);
          const renderAsPercent =
            metricName.toLowerCase().includes("margin") ||
            metricName.toLowerCase().includes("growth");

          const value = data?.[yearKey]?.[metricName];

          return (
            <EditableCell
              key={yearKey}
              isEditable={isEditableCell}
              value={value}
              onChange={(val) => onChange(metricName, yearKey, val)}
              isEvenRow={!isOddRow}
              isHighlightColumn={isHighlightColumn}
              renderAsPercent={renderAsPercent}
              formatter={renderAsPercent ? formatFinancialMargin : formatFinancialValue}
            />
          );
        })}
      </TableRow>
    );
  })}
</TableBody>

      </Table>
    </TableContainer>
    </Box>

    </>
  );
};

export default FONewFinancialTableData;
