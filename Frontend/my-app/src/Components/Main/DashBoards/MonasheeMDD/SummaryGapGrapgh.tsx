import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const SummaryGapGraph = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const payload = {
        years: [2025], // Static payload
      };

      try {
              const apiUrl = process.env.REACT_APP_API_URL;
               const token = localStorage.getItem("access_token");
        
        const response = await fetch(`${apiUrl}/api/gap_analysis/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        const foSummary = result?.['2025']?.['FO']?.['Summary'];

        if (foSummary) {
          const barData:any = [
            { name: 'Model Allocation Gap', value: foSummary['Model Allocation Gap'] },
            { name: 'Model AM Gap', value: foSummary['AM Gap'] },
            {
              name: 'Exit Gap Sum',
              value: (foSummary['Monashee Exit Gap'] || 0) + (foSummary['AM Exit Gap'] || 0),
            },
            {
              name: 'Total Gap',
              value: (foSummary['Model Return 1% Allocation'] || 0) + (foSummary['Total Return'] || 0),
            },
          ];
          setData(barData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <h3 className="text-xl font-bold mb-4">FO Summary Gap Metrics - 2025</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SummaryGapGraph;
