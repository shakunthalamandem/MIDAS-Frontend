// ABBAdditionalFundamentals.tsx
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { blue } from "@mui/material/colors";

const marketDataFields = [
  { key: "launch_date", label: "Launch Date" },
  // { key: "trade_date", label: "Trade Date" },
  { key: "market_cap", label: "Market Cap ($M)" },
  { key: "_52week_high", label: "52 Week High (Lcl)" },
  { key: "percent_from_52week_high", label: "% Below 52 Week High" },
  { key: "fcf_yield_ltm", label: "LTM FCF Yield(%)" },
  { key: "fcf_dividend_yield", label: "LTM Dividend Yield(%)" },
  { key: "shares_outstanding", label: "Shares Outstanding" },
  { key: "percent_free_float", label: "% of Free Float" },
];

const technicalDataFields = [
  { key: "_3_m_adtv_local_value", label: "3-Month ADTV (M) (lcl)" },
  { key: "_3_m_adtv_shares", label: "3-Month ADTV Shares(M)" },
  { key: "beta_benchmark", label: "Beta (S&P500)" },
  { key: "_3_m_volatility", label: "3-Month Volatility" },
  { key: "rsi_14d", label: "RSI 14D" },
  { key: "rsi_30d", label: "RSI 30D" },
  { key: "macd_9d", label: "MACD 9D" },
  { key: "_10_dma", label: "DMA 10 (lcl)" },
];

const ABBAdditionalFundamentals = ({ leftRows, rightRows, getValueColor }: any) => {
  const allRows = [...leftRows, ...rightRows];
  const flattenedRows = allRows.filter((row: any) => !row.isGroupHeader);

  const findRowForKey = (key: string) => {
    const normalizedKey = key.toLowerCase();

    const exactMatch = flattenedRows.find(
      (row: any) => row.keyPath.toLowerCase() === normalizedKey
    );
    if (exactMatch) return exactMatch;

    const suffixMatch = flattenedRows.find((row: any) =>
      row.keyPath.toLowerCase().endsWith(normalizedKey)
    );
    if (suffixMatch) return suffixMatch;

    return flattenedRows.find((row: any) =>
      row.keyPath.toLowerCase().includes(normalizedKey)
    );
  };

  const cleanNumber = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const numeric = Number(value.replace(/[^0-9.-]/g, "").trim());
      return Number.isNaN(numeric) ? undefined : numeric;
    }
    return undefined;
  };

  const formatTwoDecimals = (value: unknown) => {
    const numeric = cleanNumber(value);
    if (numeric === undefined) return undefined;
    return numeric.toFixed(2);
  };

  const buildRows = (fields: { key: string; label: string }[]) =>
    fields.map((field) => {
      const row = findRowForKey(field.key);
      const roundedValue = formatTwoDecimals(row?.rawValue);
      return {
        ...field,
        displayValue: roundedValue ?? row?.displayValue ?? "-",
        rawValue: row?.rawValue,
      };
    });

  const marketRows = buildRows(marketDataFields);
  const technicalRows = buildRows(technicalDataFields);

  const renderTable = (title: string, rows: any[]) => (
    <Paper sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid rgba(15,52,163,0.14)" }}>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          background: "linear-gradient(135deg, #f0f5ff 0%, #dfe9ff 100%)",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: blue[900] }}>
          {title}
        </Typography>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Metric</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="right">
              Value
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key}>
              <TableCell sx={{ fontWeight: 600 }}>{row.label}</TableCell>
              <TableCell align="right">
                <Typography
                  variant="body2"
                  sx={{ color: row.rawValue !== undefined ? getValueColor(row.rawValue) : blue[900] }}
                >
                  {row.displayValue}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );

  return (
    <TableContainer
      component={Paper}
      sx={{
        mt: 4,
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 25px 60px rgba(15, 52, 163, 0.15)",
        border: "1px solid rgba(15, 52, 163, 0.16)",
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2.5,
          background: "linear-gradient(135deg, #d9e8ff 0%, #eef3ff 100%)",
        }}
      >
        <Typography variant="h6" align="center" sx={{ fontWeight: 700, color: blue[900] }}>
          Public Market Data
        </Typography>
      </Box>

      <Box
        sx={{
          p: 3,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        {renderTable("Market Data", marketRows)}
        {renderTable("Technical Market Data", technicalRows)}
      </Box>
    </TableContainer>
  );
};

export default ABBAdditionalFundamentals;
