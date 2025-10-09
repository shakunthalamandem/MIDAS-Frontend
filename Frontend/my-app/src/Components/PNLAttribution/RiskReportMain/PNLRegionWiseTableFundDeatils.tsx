import React, { useEffect, useState } from "react";
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Box } from "@mui/material";

interface PNLRegionWiseTableFundDeatilsProps {
  fund: string;
}

interface RegionData {
  region: string;
  pnl: number;
  contribution: number;
}

const PNLRegionWiseTableFundDeatils: React.FC<PNLRegionWiseTableFundDeatilsProps> = ({ fund }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RegionData[]>([]);

  useEffect(() => {
    setLoading(true);

    const timeout = setTimeout(() => {
      const regions = ["North America", "Europe", "Asia", "Latin America", "Middle East"];
      const dummyData: RegionData[] = regions.map((region) => ({
        region,
        pnl: Math.floor(Math.random() * 10000 - 5000), // sample P&L
        contribution: parseFloat((Math.random() * 10).toFixed(2)), // sample contribution %
      }));

      setData(dummyData);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [fund]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, backgroundColor: "#f9f9f9", mt: 2 }}>
      <Typography variant="h6" gutterBottom color="#002060">
        Region Wise P&L Details
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e1eaff" }}>
              <TableCell><strong>Region</strong></TableCell>
              <TableCell align="right"><strong>P&L</strong></TableCell>
              <TableCell align="right"><strong>Contribution (%)</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.region}>
                <TableCell>{row.region}</TableCell>
                <TableCell align="right">{row.pnl.toLocaleString()}</TableCell>
                <TableCell align="right">{row.contribution}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PNLRegionWiseTableFundDeatils;
