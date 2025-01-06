import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Container, Typography, CircularProgress } from '@mui/material';

interface SectorwiseDataProps {
  sectors: Record<string, number>;
}

const SectorwiseData: React.FC<SectorwiseDataProps> = ({ sectors }) => {
  // Format the sectors data into the required format for PieChart
  const sectorChartData = Object.keys(sectors).map((key) => ({
    name: key,
    value: sectors[key],
  }));

  // Pie chart colors (adjust as needed)
  const colors = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#D2B4DE", "#F1948A",
    "#82E0AA", "#F7DC6F", "#F5B7B1", "#C39BD3", "#85C1AE"
  ];

  return (
    <Container sx={{ mt: 5, display: "flex", justifyContent: "center" }}>
      <Typography variant="h6" gutterBottom>
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
    </Container>
  );
};

export default SectorwiseData;
