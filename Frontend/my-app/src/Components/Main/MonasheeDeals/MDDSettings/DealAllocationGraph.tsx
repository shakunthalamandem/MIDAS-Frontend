import { Console } from 'console';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ScreenerDataRow {
  allocation_deal_size_percentage: number;
}

interface DealAllocationGraphProps {
  sectorwiseData: { [key: string]: (string | number)[] };
}

const DealAllocationGraph: React.FC<DealAllocationGraphProps> = ({ sectorwiseData }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    if (sectorwiseData) {
      fetchDataFromApi(sectorwiseData);
    }
  }, [sectorwiseData]);

  const fetchDataFromApi = async (
    data: DealAllocationGraphProps['sectorwiseData']
  ) => {
    console.log("shhs",data)
    setLoading(true);
    setError(null);
    const payload = {
      years: data.year,
      dealType: data.deal_type,
      region: data.broad_region,
      sector: data.gics_sector,
      deal_captain: data.deal_captain,
    };

    try {
      const apiUrl = process.env.REACT_APP_API_URL;

      if (!apiUrl) {
        throw new Error('API URL is not defined in environment variables');
      }

      const response = await fetch(`${apiUrl}/api/mdd_allocation_percentage/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        setApiData(result);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = (data: any) => {
    // Initialize an array to hold the formatted chart data
    const formattedData: any[] = [];

    // Iterate through each quarter (e.g., "2012 Q1", "2012 Q2", etc.)
    for (const quarter in data) {
      const sectors = data[quarter];
      const chartRow: any = { quarter }; // Each row will have the quarter as the key

      // Iterate through each deal type (FO, IPO, Others) and sum the allocation percentages for each sector
      ['FO', 'IPO', 'OTHER', 'PRIVATE'].forEach(dealType => {
        let dealTypeTotal = 0;
        
        if (sectors[dealType]) {
          for (const region in sectors[dealType]) {
            for (const sector in sectors[dealType][region]) {
              const allocation = sectors[dealType][region][sector].allocation_deal_size_percentage;
              dealTypeTotal += parseFloat(allocation);
            }
          }
        }

        // Store the total allocation for this dealType in the chart row
        chartRow[dealType] = dealTypeTotal;
      });

      formattedData.push(chartRow);
    }

    return formattedData;
  };

  const chartData = apiData ? formatChartData(apiData) : [];

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Conditionally render the bar chart */}
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="FO" stackId="a" fill="#8884d8" />
            <Bar dataKey="IPO" stackId="a" fill="#82ca9d" />
            <Bar dataKey="OTHER" stackId="a" fill="#ffc658" />
            <Bar dataKey="PRIVATE" stackId="a" fill="#002060" />

          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DealAllocationGraph;
