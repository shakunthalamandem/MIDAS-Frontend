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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

import EditableCell from "./EditableCell";
import {
  forecastYearKeys,
  forecastYearLabels,
  getOrderedMetricList,
} from "./utils/financialHelpers";
import {
  formatFinancialValue,
  formatFinancialMargin,
} from "./utils/financialFormatters";

interface FinancialTableDataProps {
  data: any;
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (metric: string, year: string, val: string) => void;
  ticker: string;
}

const FinancialTableData: React.FC<FinancialTableDataProps> = ({
  data,
  editing,
  onEdit,
  onSave,
  onCancel,
  onChange,
  ticker,
}) => {
  const orderedMetrics = getOrderedMetricList(data);

  return (
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
              ($US M)
            </TableCell>
            {forecastYearLabels.map((label, index) => {
              const yearKey = forecastYearKeys[index];
              const isEditableColumn =
                yearKey === "current_year" || yearKey === "one_year_later";

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
                  {isEditableColumn && (
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
          {orderedMetrics.map((metricName: string, rowIndex: number) => {
            const years = data[metricName] || {};
            const isEvenRow = rowIndex % 2 === 0;

            return (
              <TableRow key={metricName}>
                <TableCell
                  sx={{
                    border: "1px solid #000000",
                    fontWeight: "bold",
                    fontStyle: isEvenRow ? "normal" : "italic",
                    fontSize: "1.3rem",
                    backgroundColor: isEvenRow ? "" : "#ebebeb",
                  }}
                >
                  {metricName}
                </TableCell>

                {forecastYearKeys.map((yearKey) => {
                  const isEditableCell =
                    editing && (yearKey === "current_year" || yearKey === "one_year_later");
                  const isHighlightColumn =
                    yearKey === "current_year" || yearKey === "one_year_later";
                  const renderAsPercent =
                    metricName.toLowerCase().includes("margin") ||
                    metricName.toLowerCase().includes("growth");

                  const value = data?.[metricName]?.[yearKey];

                  return (
                    <EditableCell
                      key={yearKey}
                      isEditable={isEditableCell}
                      value={value}
                      onChange={(val) => onChange(metricName, yearKey, val)}
                      isEvenRow={isEvenRow}
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
  );
};

export default FinancialTableData;
