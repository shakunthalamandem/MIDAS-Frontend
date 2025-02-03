import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography, useTheme, Card, CardContent, Container } from "@mui/material";

interface YearData {
  [year: string]: {
    count: number;
    avg_fo_discount: number;
  };
}

interface Props {
  data: YearData;
}

const AvgFoDiscountChart: React.FC<Props> = ({ data }) => {
  const theme = useTheme(); // Use theme for consistent colors

  const chartData = Object.entries(data).map(([year, values]) => ({
    year,
    avgFoDiscount: values.avg_fo_discount,
    count: values.count,
  }));

  if (chartData.length === 0) {
    return (
      <Box sx={{ textAlign: "center", padding: 4 }}>
        <Typography variant="h6" color="textSecondary">
          No Data Available for the selected filters.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Please change the selected filters to show the Plot.
        </Typography>
      </Box>
    );
  }

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { year, avgFoDiscount, count } = payload[0].payload;
      return (
        <Box
          sx={{
            padding: 2,
            backgroundColor: "#FFFFFF",
            color:'#002060',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "4px",
            boxShadow: theme.shadows[1],
          }}
        >
          <Typography variant="body1" fontWeight="bold" color="#68021d">
            Year: {year}
          </Typography>
          <Typography variant="body2">
            Avg FO Discount: <span style={{fontWeight:'bold'}}>{avgFoDiscount.toFixed(2)}</span>
          </Typography>
          <Typography variant="body2">Count: <span style={{fontWeight:'bold'}}>{count}</span></Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>

    <Card
      elevation={4}
      sx={{
        width: "100%",
        maxWidth: 800,
        margin: "auto",
        padding: 2,
        backgroundColor: theme.palette.background.default,
        borderRadius: "8px",
        boxShadow: theme.shadows[2],
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            marginBottom: 2,
            textAlign: "center",
            fontWeight: "bold",
            color: "#002060",
          }}
        >
          Average FO Discount by Year
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="year"
              tick={{
                fill: "#002060",
                fontSize: 12,
              }}
              tickLine={false}
              axisLine={{ stroke: theme.palette.divider }}
            />
            <YAxis
              tick={{
                fill: "#002060",
                fontSize: 12,

              }}
              tickLine={false}
              axisLine={{ stroke: theme.palette.divider }}
              width={50}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: theme.palette.action.hover }}
            />
            <Bar
              dataKey="avgFoDiscount"
              fill='#68021d'
              radius={[4, 4, 0, 0]} // Rounded top corners
              animationDuration={800} // Animation for bars
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
    </Container>
  );
};

export default AvgFoDiscountChart;
