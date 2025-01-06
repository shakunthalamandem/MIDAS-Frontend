import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";

interface CumulativeReturn {
  date: string;
  snp_return: number;
  dow_jone_return: number;
  russel_return: number;
  portfolio: number;
}

interface CumulativeReturnsProps {
  tickerList: string[];
}

const CumulativeReturns: React.FC<CumulativeReturnsProps> = ({ tickerList }) => {
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
        ticker_list: tickerList,
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

        setChartData(responseData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An error occurred while fetching the data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tickerList]);

  // Function to format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 5, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 5, display: "flex", justifyContent: "center" }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

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
          <Typography
            variant="h6"
            gutterBottom
            color={"#002060"}
            align="center"
            sx={{ mb: 2 }}
          >
            <strong>Cumulative Returns</strong>
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="snp_return"
                stroke="#8884d8"
                name="S&P Return"
                dot={false}
                strokeWidth={1}
              />
              <Line
                type="monotone"
                dataKey="dow_jone_return"
                stroke="#9e0f01"
                name="Dow Jones Return"
                dot={false}
                strokeWidth={1}
              />
              <Line
                type="monotone"
                dataKey="russel_return"
                stroke="#017c53"
                name="Russell Return"
                dot={false}
                strokeWidth={1}
              />
              <Line
                type="monotone"
                dataKey="portfolio"
                stroke="#ff7300"
                name="Portfolio"
                dot={false}
                strokeWidth={1}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CumulativeReturns;
