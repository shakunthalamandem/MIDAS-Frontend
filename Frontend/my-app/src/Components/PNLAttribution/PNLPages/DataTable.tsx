import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Paper,
  Box,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";

interface StrategyData {
  custom_group1?: string;
  custom_group2?: string;
  broad_region?: string;
  total: number;
}

interface DataTableProps {
  title: string;
  top_5_strategies: StrategyData[];
  bottom_5_strategies: StrategyData[];
  groupKey: keyof StrategyData;
  high: number;
  low: number;
  total_sum: number;
}

const HighlightStats = ({ high, low, total }: { high: number; low: number; total: number }) => (
  <Box mb={2} display="flex" flexWrap="wrap" gap={2}>
    <Chip label={`High: ${high.toLocaleString()}`} color="success" variant="outlined" />
    <Chip label={`Low: ${low.toLocaleString()}`} color="error" variant="outlined" />
    <Chip label={`Total: ${total.toLocaleString()}`} color="primary" variant="outlined" />
  </Box>
);

const DataTable: React.FC<DataTableProps> = ({
  title,
  top_5_strategies,
  bottom_5_strategies,
  groupKey,
  high,
  low,
  total_sum,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <HighlightStats high={high} low={low} total={total_sum} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Top </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{groupKey}</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {top_5_strategies.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row[groupKey]}</TableCell>
                      <TableCell align="right">{row.total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Bottom</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{groupKey}</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bottom_5_strategies.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row[groupKey]}</TableCell>
                      <TableCell align="right">{row.total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  </motion.div>
);

export default DataTable;
