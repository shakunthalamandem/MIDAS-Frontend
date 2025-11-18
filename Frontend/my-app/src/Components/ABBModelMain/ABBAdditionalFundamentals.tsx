// ABBAdditionalFundamentals.tsx
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { blue } from "@mui/material/colors";

const ABBAdditionalFundamentals = ({ leftRows, rightRows, getValueColor }: any) => {
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
      {/* HEADER */}
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

      {/* SPLIT TWO TABLES */}
      <Box
        sx={{
          p: 3,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        {/* LEFT TABLE */}
        <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Metric</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Value</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {leftRows.map((row: any) => (
                <TableRow
                  key={row.keyPath}
                  sx={{
                    backgroundColor: row.isGroupHeader ? "rgba(195, 217, 255, 0.6)"
                      : row.depth % 2 === 0 ? "#fff" : "#f7f9ff",
                  }}
                >
                  <TableCell sx={{ fontWeight: row.isGroupHeader ? 700 : 600, pl: row.depth * 3 + 1 }}>
                    {row.label}
                  </TableCell>

                  <TableCell align="right">
                    {row.isGroupHeader ? (
                      <Typography variant="body2" color="text.secondary">
                        Contains {Object.keys(row.rawValue || {}).length} fields
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ color: getValueColor(row.rawValue) }}>
                        {row.displayValue}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* RIGHT TABLE - identical */}
        <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Metric</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Value</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rightRows.map((row: any) => (
                <TableRow
                  key={row.keyPath}
                  sx={{
                    backgroundColor: row.isGroupHeader ? "rgba(195, 217, 255, 0.6)"
                      : row.depth % 2 === 0 ? "#fff" : "#f7f9ff",
                  }}
                >
                  <TableCell sx={{ fontWeight: row.isGroupHeader ? 700 : 600, pl: row.depth * 3 + 1 }}>
                    {row.label}
                  </TableCell>

                  <TableCell align="right">
                    {row.isGroupHeader ? (
                      <Typography variant="body2" color="text.secondary">
                        Contains {Object.keys(row.rawValue || {}).length} fields
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ color: getValueColor(row.rawValue) }}>
                        {row.displayValue}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </TableContainer>
  );
};

export default ABBAdditionalFundamentals;
