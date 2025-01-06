import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Container, Typography, Card, CardContent } from '@mui/material';

interface SectorwiseDataProps {
  sectors: Record<string, number> | { [key: string]: { name: string; value: Record<string, number> } };
}

const SectorwiseData: React.FC<SectorwiseDataProps> = ({ sectors }) => {
  let sectorChartData: { name: string; value: number }[] = [];

  // Check and handle nested structure
  if (typeof sectors === 'object' && '0' in sectors) {
    const nestedData = (sectors as any)['0'].value;
    sectorChartData = Object.entries(nestedData).map(([key, value]) => ({
      name: key,
      value: typeof value === "number" ? Math.round(value) : 0, // Ensure `value` is a number
    }));
  } else {
    // Assume flat structure
    sectorChartData = Object.entries(sectors).map(([key, value]) => ({
      name: key,
      value: typeof value === "number" ? Math.round(value) : 0, // Ensure `value` is a number
    }));
  }

  console.log("Formatted sectorChartData (rounded):", sectorChartData);

  const colors = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#D2B4DE", "#F1948A",
    "#82E0AA", "#F7DC6F", "#F5B7B1", "#C39BD3", "#85C1AE",
  ];

  return (
    <Container sx={{ mt: 5, display: "flex", justifyContent: "center" }}>
      <Card
        sx={{
          width: "100%",
          maxWidth: 1200,
          marginBottom: "16px",
          boxShadow: "0 4px 8px 0 #c6f5e4, 0 6px 20px 0 #c6f5e4",
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom color="#002060" align='center' sx={{fontWeight:'bold'}}>
            Sector Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={sectorChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {sectorChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SectorwiseData;
