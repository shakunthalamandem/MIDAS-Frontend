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
  styled,
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

const StyledTableCell = styled(TableCell)({
  color: "#FFFFFF",
  fontWeight: "bold",
});

const FONewFinancialTableData: React.FC<FONewFinancialTableDataProps> = ({
  data,
  editing,
  onEdit,
  onSave,
  onCancel,
  onChange,
}) => {
  const formatLabel = (value: string) =>
    value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const columnKeys = Object.keys(data || {}).filter(
    (key) => key !== "metric_name" && key !== "ticker_name"
  );
  const orderedColumnKeys = [
    ...columnKeys.filter((key) => !key.toLowerCase().includes("yoy")),
    ...columnKeys.filter((key) => key.toLowerCase().includes("yoy")),
  ];
  const editableColumnKeys = columnKeys;
  const metricList: string[] = [];
  const metricSet = new Set<string>();
  const showEditControls = Boolean(onEdit && onSave && onCancel);

  for (const colKey of orderedColumnKeys) {
    const metrics = Object.keys(data?.[colKey] || {});
    for (const metric of metrics) {
      if (!metricSet.has(metric)) {
        metricSet.add(metric);
        metricList.push(metric);
      }
    }
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table size="medium">
        <TableHead sx={{ backgroundColor: "#002060" }}>
          <TableRow>
            <StyledTableCell>Metric</StyledTableCell>
            {orderedColumnKeys.map((label) => {
              const isEditableColumn = editableColumnKeys.includes(label);

              return (
                <StyledTableCell key={label} align="right">
                  {formatLabel(label)}
                  {isEditableColumn && showEditControls && (
                    <>
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
                    </>
                  )}
                </StyledTableCell>
              );
            })}
          </TableRow>
        </TableHead>

        <TableBody>
          {metricList.map((metricName: string) => (
            <TableRow key={metricName} sx={{ fontSize: "1rem" }}>
              <TableCell>{formatLabel(metricName)}</TableCell>

              {orderedColumnKeys.map((yearKey) => {
                const isEditableCell =
                  editing && editableColumnKeys.includes(yearKey);
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
                    isEvenRow
                    isHighlightColumn={false}
                    renderAsPercent={renderAsPercent}
                    formatter={
                      renderAsPercent ? formatFinancialMargin : formatFinancialValue
                    }
                    align="right"
                  />
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FONewFinancialTableData;
