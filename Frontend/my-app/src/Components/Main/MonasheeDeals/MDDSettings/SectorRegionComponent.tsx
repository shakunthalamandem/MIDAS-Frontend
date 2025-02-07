import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";

interface DealData {
  [category: string]: {
    [metric: string]: number;
  };
}

interface YearlyData {
  [year: string]: DealData;
}

interface SectorRegionTypeComponentProps {
  data: YearlyData;
}

const SectorRegionComponent: React.FC<SectorRegionTypeComponentProps> = ({ data }) => {
  return (
    <div>
      {Object.entries(data).map(([year, categories]) => (
        <Paper key={year} sx={{ mb: 4, p: 2 }}>
          <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
            {`Financial Data for ${year}`}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px" }}>Category</TableCell>
                  <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px" }} align="right">Number of Deals</TableCell>
                  <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px" }} align="right">Weighted Allocation as % of Deal Size</TableCell>
                  <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px" }} align="right">Weighted Allocation as % of IOI</TableCell>
                  <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px" }} align="right">Deal Volume</TableCell>
                  <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px" }} align="right">Model Actual Return</TableCell>
                  <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px" }} align="right">Model Return 1% Allocation</TableCell>
                  <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px" }} align="right">Net of Hedge</TableCell>
                  <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px" }} align="right">Allocation Return</TableCell>
                  <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px" }} align="right">AM Return</TableCell>
                  <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px" }} align="right">Model AM Return</TableCell>
                  <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px" }} align="right">Total Return</TableCell>
                  <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px" }} align="right">Max T+1M Return from Dealogic</TableCell>
                  <TableCell sx={{ fontSize: "0.725rem", fontWeight: "bold", border: "1px solid #ddd", padding: "4px 8px" }} align="right">Min T+1M Return from Dealogic</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(categories)
                  .sort(([a], [b]) => (a === "Summary" ? 1 : b === "Summary" ? -1 : a.localeCompare(b)))
                  .map(([category, values]) => (
                    <TableRow key={category}>
                      <TableCell>{category}</TableCell>
                      <TableCell align="right">{values["Number of deals"]}</TableCell>
                      <TableCell align="right">{values["Weighted Allocation as % of Deal Size"]}</TableCell>
                      <TableCell align="right">{values["Weighted Allocation as % of IOI"]}</TableCell>
                      <TableCell align="right">{values["Deal volume"]}</TableCell>
                      <TableCell align="right">{values["Model Actual Return"]}</TableCell>
                      <TableCell align="right">{values["Model Return 1% Allocation"]}</TableCell>
                      <TableCell align="right">{values["Net of Hedge"]}</TableCell>
                      <TableCell align="right">{values["Allocation Return"]}</TableCell>
                      <TableCell align="right">{values["AM Return"]}</TableCell>
                      <TableCell align="right">{values["Model AM Return"]}</TableCell>
                      <TableCell align="right">{values["Total Return"]}</TableCell>
                      <TableCell align="right">{values["Max t1m_return_from_dealogic"]}</TableCell>
                      <TableCell align="right">{values["Min t1m_return_from_dealogic"]}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}
    </div>
  );
};

export default SectorRegionComponent;
