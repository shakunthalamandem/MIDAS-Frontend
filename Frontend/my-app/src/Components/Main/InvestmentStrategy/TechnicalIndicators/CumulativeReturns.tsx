import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        setError("API URL is not defined in environment variables");
        return;
      }

      const payload = {
        ticker_list: ["ZVRA US", "LRMR US"],
      };

      try {
        const response = await fetch(`${apiUrl}/api/cumulative_returns/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const responseData = await response.json();

        // Transform the response data into a usable format for the chart
        const transformedData: CumulativeReturn[] = Object.entries(responseData).map(([date, values]: any) => ({
          date,
          snp_return: values.snp_return,
          dow_jone_return: values.dow_jone_return,
          russel_return: values.russel_return,
          portfolio: values.portfolio,
        }));

        setChartData(transformedData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An error occurred while fetching the data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
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
