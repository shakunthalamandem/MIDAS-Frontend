import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Box,
  Alert,
  Typography,
} from "@mui/material";

interface RiskReportRegionWiseTableProps {
  fund: string;
}

interface RegionWiseData {
  region: string;
  netOfHedgePnlPercent: number | string;
  longExposure: number | string;
  betaAdjLongExp: number | string;
  netOfHedgePnl: number | string;
}

const REGION_ORDER = ["US", "EMEA", "APAC", "Non-US America"];

const formatPercent = (value: number | string) => {
  if (value === "–" || value === null || value === undefined) return "–";
  return `${Number(value).toFixed(2)}%`;
};
const formatPercentlmv = (value: number | string) => {
  if (value === "–" || value === null || value === undefined) return "–";
  return `${Number(value).toFixed(1)}%`;
};

const formatDollarK = (value: number | string) => {
  if (value === "–" || value === null || value === undefined) return "–";
  
  const num = Number(value);
  const numInK = Math.abs(num) / 1000; // convert to thousands
  const formatted = numInK.toLocaleString(undefined, { maximumFractionDigits: 0 });
  
  return num < 0 ? `($${formatted}K)` : `$${formatted}K`;
};


const RiskReportRegionWiseTable: React.FC<RiskReportRegionWiseTableProps> = ({
  fund,
}) => {
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<RegionWiseData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fund) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch(`${apiUrl}/api/risk_report_region_summary/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ fund }),
        });

        if (!res.ok) throw new Error("Failed to fetch region-wise data");

        const data = await res.json();

        if (!data || typeof data !== "object" || !data.risk_report_region_wise) {
          throw new Error("Invalid response structure");
        }

        const rr = data.risk_report_region_wise;

        // Map the regions in the desired order
        const formattedData: RegionWiseData[] = REGION_ORDER.map((region) => ({
          region,
          netOfHedgePnlPercent: rr.net_of_hedge_pnl_pct?.[region] ?? "–",
          longExposure: rr.long_exposure_pct?.[region] ?? "–",
          betaAdjLongExp: rr.beta_adj_exposure_pct?.[region] ?? "–",
          netOfHedgePnl: rr.net_of_hedge_pnl?.[region] ?? "–",
        }));

        setTableData(formattedData);
      } catch (error: any) {
        setError(error.message || "Error fetching table data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fund]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  if (!tableData.length)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Alert severity="warning">No region-wise data available.</Alert>
      </Box>
    );

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        <Typography
          variant="h6"
          gutterBottom
          color="#002060"
          align="center"
          bgcolor="#e6f0ff"
          fontWeight={600}
        >
           Region-wise Fund Details (DTD)
        </Typography>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e6f0ff" ,}}>
              <TableCell align="center"  sx={{fontWeight:600,color:'#002060'}} >Region</TableCell>
              <TableCell align="center"  sx={{fontWeight:600,color:'#002060'}}>Net Of Hedge P&L(%)</TableCell>
              <TableCell align="center"  sx={{fontWeight:600,color:'#002060'}}>Long Exposure / LMV(%)</TableCell>
              <TableCell align="center"  sx={{fontWeight:600,color:'#002060'}}>Beta Adj. Long Exp./LMV(%)</TableCell>
              <TableCell align="center"  sx={{fontWeight:600,color:'#002060'}}>Net Of Hedge P&L</TableCell>
            </TableRow>
          </TableHead>
<TableBody>
  {tableData.map((row) => (
    <TableRow
      key={row.region}
      sx={{
        height: 26,
      }}
    >
      <TableCell align="center">{row.region}</TableCell>
      <TableCell align="center">
        {formatPercent(row.netOfHedgePnlPercent)}
      </TableCell>
      <TableCell align="center">
        {formatPercentlmv(row.longExposure)}
      </TableCell>
      <TableCell align="center">
        {formatPercentlmv(row.betaAdjLongExp)}
      </TableCell>
      <TableCell align="center">
        {formatDollarK(row.netOfHedgePnl)}
      </TableCell>
    </TableRow>
  ))}
</TableBody>


        </Table>
      </Paper>
    </Box>
  );
};

export default RiskReportRegionWiseTable;
