// ABBDiscountTable.tsx
import { Box, Paper, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { blue } from "@mui/material/colors";

const parseNumericValue = (value: any) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const numeric = Number(value.replace(/[^0-9.-]/g, "").trim());
    return Number.isNaN(numeric) ? null : numeric;
  }
  return null;
};

const formatTwoDecimals = (value: any, fallback?: string) => {
  const numeric = parseNumericValue(value);
  if (numeric === null) {
    return fallback ?? "-";
  }
  return numeric.toFixed(2);
};

const ABBDiscountTable = ({
  liquidityRow,
  totalRow,
  leftTableRows,
  rightTableRows,
  getValueColor,
}: any) => {
  return (
    <Paper
      sx={{
        mt: 4,
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 25px 50px rgba(0,0,0,0.08)",
        border: "1px solid rgba(15, 52, 163, 0.16)",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          background: "linear-gradient(135deg, #d9e8ff 0%, #eef3ff 100%)",
        }}
      >
        <Typography variant="h6" align="center" sx={{ fontWeight: 700, color: blue[900] }}>
          Discount Overview
        </Typography>

      </Box>

      {/* HIGHLIGHT CARDS */}
      <Box sx={{ p: 3, display: "flex", gap: 3 }}>
        {liquidityRow && (
          <Paper sx={{ flex: 1, p: 2.5, borderRadius: 2, background: "#f0f6ff" }}>
            <Typography sx={{ fontWeight: 600 }}>Liquidity Model Discount</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: getValueColor(liquidityRow.rawValue) }}>
              {formatTwoDecimals(liquidityRow.rawValue, liquidityRow.displayValue)}
            </Typography>
          </Paper>
        )}

        {totalRow && (
          <Paper sx={{ flex: 1, p: 2.5, borderRadius: 2, background: "#e8fff1" }}>
            <Typography sx={{ fontWeight: 600 }}>Final Discount</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: getValueColor(totalRow.rawValue) }}>
              {formatTwoDecimals(totalRow.rawValue, totalRow.displayValue)}
            </Typography>
          </Paper>
        )}
      </Box>

      {/* TWO SMALL TABLES */}
      <Box
        sx={{
          px: 3,
          pb: 3,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        {/* LEFT TABLE */}
        <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Table size="small">
            <TableBody>
              {leftTableRows.map((row: any) => (
                <TableRow key={row.keyPath}>
                  <TableCell sx={{ fontWeight: 600 }}>{row.label}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: getValueColor(row.rawValue) }}>
                    {formatTwoDecimals(row.rawValue, row.displayValue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* RIGHT TABLE */}
        <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Table size="small">
            <TableBody>
              {rightTableRows.map((row: any) => (
                <TableRow key={row.keyPath}>
                  <TableCell sx={{ fontWeight: 600 }}>{row.label}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: getValueColor(row.rawValue) }}>
                    {formatTwoDecimals(row.rawValue, row.displayValue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Paper>
  );
};

export default ABBDiscountTable;
