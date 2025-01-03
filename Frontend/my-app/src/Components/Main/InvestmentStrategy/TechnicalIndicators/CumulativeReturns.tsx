import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";

interface CumulativeReturn {
  date: string;
  snp_return: number;
  dow_jone_return: number;
  russel_return: number;
  portfolio: number;
}

const CumulativeReturns: React.FC = () => {
  const [chartData, setChartData] = useState<CumulativeReturn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const payload = {
          ticker_list: ["ZVRA US", "LRMR US"]
        };

        const response = await axios.post(
          "http://192.168.1.59:9000/api/cumulative_returns/",
          payload
        );

        // Transform the response data into a usable format for the chart
        const transformedData: CumulativeReturn[] = Object.entries(response.data).map(([date, values]: any) => ({
          date,
          snp_return: values.snp_return,
          dow_jone_return: values.dow_jone_return,
          russel_return: values.russel_return,
          portfolio: values.portfolio,
        }));

        setChartData(transformedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="snp_return" stroke="#8884d8" name="S&P Return" />
        <Line type="monotone" dataKey="dow_jone_return" stroke="#82ca9d" name="Dow Jones Return" />
        <Line type="monotone" dataKey="russel_return" stroke="#ffc658" name="Russell Return" />
        <Line type="monotone" dataKey="portfolio" stroke="#ff7300" name="Portfolio" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CumulativeReturns;
