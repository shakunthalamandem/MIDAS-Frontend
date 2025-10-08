import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grow,
  Grid,
} from "@mui/material";

interface TableRowData {
  label: string;
  value: number | string;
}

interface PNLLmvDataTablesMainProps {
  fund: string;
}

interface FundData {
  section1: TableRowData[];
  section2: TableRowData[];
  section3: TableRowData[];
  section4: TableRowData[];
}

const headerColors = ["#8ca2b8ff", "#d7bcdbff", "#e9cdc4ff", "#c5e6c6ff"];

const PNLLmvDataTablesMain: React.FC<PNLLmvDataTablesMainProps> = ({ fund }) => {
  const [data, setData] = useState<FundData>({
    section1: [],
    section2: [],
    section3: [],
    section4: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFundData = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) throw new Error("API URL is not defined");

        const response = await fetch(`${apiUrl}/api/risk_report_lmv_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ fund }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const result: FundData = await response.json();
        setData(result);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (fund) fetchFundData();
  }, [fund]);

  const renderVerticalTable = (sectionData: TableRowData[], color: string, index: number) => (
    <Grow in timeout={500 + index * 200}>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table size="small"> {/* smaller table size */}
          <TableHead sx={{ backgroundColor: color }}>
            <TableRow sx={{ height: 30 }}> {/* reduced header row height */}
              <TableCell sx={{ fontWeight: "bold", color: "#050505ff", py: 0.5 }}>Label</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#050505ff", py: 0.5 }}>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sectionData.map((row: TableRowData, idx: number) => (
              <TableRow key={idx} sx={{ height: 28 }}> {/* reduced row height */}
                <TableCell sx={{ py: 0.5 }}>{row.label}</TableCell>
                <TableCell sx={{ py: 0.5 }}>{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grow>
  );

  if (loading) return <p>Loading data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        {renderVerticalTable(data.section1, headerColors[0], 0)}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderVerticalTable(data.section2, headerColors[1], 1)}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderVerticalTable(data.section3, headerColors[2], 2)}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderVerticalTable(data.section4, headerColors[3], 3)}
      </Grid>
    </Grid>
  );
};

export default PNLLmvDataTablesMain;
