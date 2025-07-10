import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { Box, Typography, CircularProgress } from "@mui/material";

interface Top10ExposureChartProps {
    fund: string;
}

interface ExposureData {
    ticker: string;
    value: number;
}

const formatNumber = (value: number): string => {
    const absValue = Math.abs(value);
    let formattedValue: string;

    if (absValue >= 1e9) {
        formattedValue = `${(absValue / 1e9).toFixed(2)}B`;
    } else if (absValue >= 1e6) {
        formattedValue = `${(absValue / 1e6).toFixed(2)}M`;
    } else if (absValue >= 1e3) {
        formattedValue = `${(absValue / 1e3).toFixed(2)}K`;
    } else {
        formattedValue = absValue.toString();
    }

    return value < 0 ? `-$${formattedValue}` : `$${formattedValue}`;
};

const Top10ExposureChart: React.FC<Top10ExposureChartProps> = ({ fund }) => {
    const [data, setData] = useState<ExposureData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`${apiUrl}/api/top10_exposures/`, {
                    method: "POST",
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ fund }),
                });

                const result = await res.json();

                if (result?.Top10Exposure) {
                    const formattedData = Object.entries(result.Top10Exposure).map(
                        ([ticker, value]) => ({
                            ticker,
                            value: Number(value),
                        })
                    );
                    setData(formattedData);
                } else {
                    setError("Invalid response format.");
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to fetch data.");
            } finally {
                setLoading(false);
            }
        };

        if (fund) {
            fetchData();
        }
    }, [fund, apiUrl, token]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" p={2}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={2}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box p={2}>
            <Typography
                variant="h6"
                sx={{
                    color: '#002060',
                    fontWeight: 600,
                    mb: 1,
                }}
                align="center"
            >
                Top 10 Tickers by Net View for {fund}
            </Typography>
            {/* <Typography variant="h6" gutterBottom align="center">
                
            </Typography> */}
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={formatNumber} />
                    <YAxis
                        type="category"
                        dataKey="ticker"
                        tickMargin={15}
                        interval={0}
                        width={120}
                        tick={{
                            width: 100,
                            overflow: "hidden",
                        }}
                        style={{ whiteSpace: "nowrap" }}
                    />
                    <Tooltip
                        formatter={(value: number) => formatNumber(value)}
                        labelStyle={{ fontWeight: "bold" }}
                    />
                    <Bar dataKey="value" fill="#1976d2" barSize={20} />
                </BarChart>
            </ResponsiveContainer>

        </Box>
    );
};

export default Top10ExposureChart;
