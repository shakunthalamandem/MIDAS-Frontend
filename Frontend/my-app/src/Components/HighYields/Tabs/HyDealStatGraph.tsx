import { Card, Container } from "@mui/material";
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SelectedFilters {
  // Define the structure of selectedFilters here
  [key: string]: any;
}

const HyDealStatGraph = ({ selectedFilters }: { selectedFilters: SelectedFilters }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const response = await fetch(`${apiUrl}/api/high_yields_graph/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(selectedFilters),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();
        setData(result.main_aggregation);
      } catch (error) {
        setError((error as any).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedFilters]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Container>
        <Card sx={{ mt: 2 ,mb: 2, padding: 10 }}> 
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>

        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Bar type="monotone" dataKey="count" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
    </Card>
    </Container>
  );
};

export default HyDealStatGraph;