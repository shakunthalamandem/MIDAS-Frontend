import React, { useEffect, useState } from 'react';
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
    [key: string]: {
      deal_count: number;
      deal_size: number;
    };
    avg: {
      avg_deal_count: number;
      avg_deal_size: number;
    };
    cumulative_avg: {
      cumulative_avg_deal_count: number;
      cumulative_avg_deal_size: number;
    };
  };
};

const CumulativeChart: React.FC = () => {
  const [data, setData] = useState<ChartData | null>(null);

  // Fetch data from API
  useEffect(() => {
    fetch('http://192.168.1.17:9000/api/cummulatives_monashee/')
      .then((response) => response.json())
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  // Ensure data is available before rendering chart
  if (!data) {
    return <div>Loading...</div>;
  }

  const labels: string[] = Object.keys(data);
  const cumDealCount: number[] = labels.map(
    (label) => data[label].cumulative_avg.cumulative_avg_deal_count
  );
  const cumDealSize: number[] = labels.map(
    (label) => data[label].cumulative_avg.cumulative_avg_deal_size
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Cumulative Average Deal Count',
        data: cumDealCount,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
        tension: 0.2,
      },
      {
        label: 'Cumulative Average Deal Size',
        data: cumDealSize,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: false,
        tension: 0.2,
      },
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
