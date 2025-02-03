import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
);

type ChartData = {
  [key: string]: {
    cumdeal_size: number;
    cumdeal_count: number;
  };
};

interface CumulativeChartProps {
  data: ChartData;
}

const CumulativeChart: React.FC<CumulativeChartProps> = ({ data }) => {
  const labels: string[] = Object.keys(data);
  const cumDealSize: number[] = labels.map(label => data[label].cumdeal_size);
  const cumDealCount: number[] = labels.map(label => data[label].cumdeal_count);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Cumulative Deal Size',
        data: cumDealSize,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
        tension: 0.2,
      },
      {
        label: 'Cumulative Deal Count',
        data: cumDealCount,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: false,
        tension: 0.2,
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Value',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Week',
        },
      },
    },
  };

  return (
    <div>
      <h2>Cumulative Chart</h2>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default CumulativeChart;
