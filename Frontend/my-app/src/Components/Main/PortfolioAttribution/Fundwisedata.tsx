import React, { useEffect, useState } from "react";
import {
    Box,
    CircularProgress,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Container,
} from "@mui/material";
import { Link } from "react-router-dom";

const formatNumber = (value: number) => {
    if (value === undefined || value === null) return "-";
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    let formattedValue;

    formattedValue = absValue >= 1_000 ? (absValue / 1_000).toFixed(0) + "K" : absValue.toFixed(2);

    return isNegative ? `-$${formattedValue}` : `$${formattedValue}`;
};

const Fundwisedata: React.FC = () => {
    const [data, setData] = useState<{ fund: string; Jan: number; Feb: number; Mar: number; YTD: number }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!apiUrl) {
                    throw new Error("API URL is not defined in environment variables");
                }

                const response = await fetch(`${apiUrl}/api/portfolio_attribution/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                    body: JSON.stringify({ filter_type: "fund" }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch fund-wise data");
                }

                const result = await response.json();

                // Transform API response
                const formattedData = result.map((item: any) => {
                    const fundName = Object.keys(item)[0]; // Extract fund name
                    const fundValues = item[fundName]; // Extract month-wise data
                    const Jan = fundValues.Jan || 0;
                    const Feb = fundValues.Feb || 0;
                    const Mar = fundValues.Mar || 0;
                    const YTD = Jan + Feb + Mar; // Calculate YTD

                    return {
                        fund: fundName,
                        Jan,
                        Feb,
                        Mar,
                        YTD, // Add YTD column
                    };
                });

                setData(formattedData);
                setLoading(false);
            } catch (error: any) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl, token]);

    // Calculate total values
    const totalJan = data.reduce((sum, row) => sum + row.Jan, 0);
    const totalFeb = data.reduce((sum, row) => sum + row.Feb, 0);
    const totalMar = data.reduce((sum, row) => sum + row.Mar, 0);
    const totalYTD = data.reduce((sum, row) => sum + row.YTD, 0);

    return (
        <Box sx={{ width: "100%", backgroundColor: "#fff", p: 2 }}>
            <Container>
                <Typography variant="h5" color="#002060" align="center" fontWeight={600} marginBottom={2}>
                    2025 YTD Net of Hedge P&L Attribution by Fund
                </Typography>

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <TableContainer component={Paper} sx={{ border: "1px solid #ddd" }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#466675" }}>
                                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold", border: "1px solid #ddd" }}>
                                        Fund
                                    </TableCell>
                                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold", border: "1px solid #ddd", textAlign: "center" }}>
                                        Jan
                                    </TableCell>
                                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold", border: "1px solid #ddd", textAlign: "center" }}>
                                        Feb
                                    </TableCell>
                                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold", border: "1px solid #ddd", textAlign: "center" }}>
                                        Mar
                                    </TableCell>
                                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold", border: "1px solid #ddd", textAlign: "center" }}>
                                        YTD
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((row, index) => (
                                    <TableRow key={index} sx={{ backgroundColor: index % 2 ? "#f5f5f5" : "#ffffff" }}>
                                        <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd", whiteSpace: "nowrap" }}>
                                            <Link
                                                to={`/equity/portfolio-attribution/fund/${row.fund}`}
                                                style={{ color: "#A52A2A", textDecoration: "none" }}
                                                target="_blank"
                                            >
                                                {row.fund}
                                            </Link>
                                        </TableCell>
                                        <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>
                                            {formatNumber(row.Jan)}
                                        </TableCell>
                                        <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>
                                            {formatNumber(row.Feb)}
                                        </TableCell>
                                        <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>
                                            {formatNumber(row.Mar)}
                                        </TableCell>
                                        <TableCell sx={{ border: "1px solid #ddd", textAlign: "center"}}>
                                            {formatNumber(row.YTD)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {/* Total Row */}
                                <TableRow sx={{ backgroundColor: "#91ce89" }}>
                                    <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd", textAlign: "center" }}>
                                        Total
                                    </TableCell>
                                    <TableCell sx={{ border: "1px solid #ddd", textAlign: "center", fontWeight: "bold" }}>
                                        {formatNumber(totalJan)}
                                    </TableCell>
                                    <TableCell sx={{ border: "1px solid #ddd", textAlign: "center", fontWeight: "bold" }}>
                                        {formatNumber(totalFeb)}
                                    </TableCell>
                                    <TableCell sx={{ border: "1px solid #ddd", textAlign: "center", fontWeight: "bold" }}>
                                        {formatNumber(totalMar)}
                                    </TableCell>
                                    <TableCell sx={{ border: "1px solid #ddd", textAlign: "center", fontWeight: "bold" }}>
                                        {formatNumber(totalYTD)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Container>
        </Box>
    );
};

export default Fundwisedata;
