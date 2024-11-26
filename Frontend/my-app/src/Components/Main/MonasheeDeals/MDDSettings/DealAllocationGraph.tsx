import React, { useEffect, useState } from 'react';
import { Container, Card, CardContent, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define types for the data you expect
interface DealAllocationGraphProps {
  data: any; // Use the appropriate type here for the data you are working with
}

const DealAllocationGraph: React.FC = () => {
  const [graphData, setGraphData] = useState<any>(null);

  // Fetch the data on mount or when any dependencies change
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;

        if (!apiUrl) {
          throw new Error('API URL is not defined in environment variables');
        }

        const response = await axios.get(`${apiUrl}/api/dealallocation/`);
        const data = response.data;

        // Assuming the data format will be something like:
        // { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [10, 20, 30, 40] }
        setGraphData(data);
      } catch (error) {
        console.error('Error fetching graph data:', error);
      }
    };

    fetchGraphData();
  }, []); // Empty array ensures this only runs once on component mount

  // Create chart data for rendering
  const chartData = {
    labels: graphData?.labels || [],
    datasets: [
      {
        label: 'Deal Allocation',
        data: graphData?.values || [],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  // Options for the chart (customize as needed)
  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Deal Allocation Overview'
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 0 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#3b3f57', fontWeight: 'bold' }}>
            Deal Allocation Graph
          </Typography>

          {/* Render the graph only if graphData is available */}
          {graphData ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <Typography variant="body2">Loading Graph Data...</Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default DealAllocationGraph;
