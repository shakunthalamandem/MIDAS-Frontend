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
import DealStatsMain from "../../HighYields/Tabs/DealStatsMain";
// import DealStatsMain from './DealStatsMain'; // Importing the DealStatsMain component

const formatNumber = (value: number) => {
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    let formattedValue;

    formattedValue = (absValue / 1_000).toFixed(0) + "K";

    return isNegative ? `-$${formattedValue}` : `$${formattedValue}`;
};

const Fundwisedata: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
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
                setData(result);
                setLoading(false);
            } catch (error: any) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl, token]);

    const totalPnl = formatNumber(data.reduce((sum, row) => sum + row.pnl, 0));
    const totalhurdle_return = formatNumber(data.reduce((sum, row) => sum + row.hurdle_return, 0));
    const totalNet = formatNumber(data.reduce((sum, row) => sum + (row.net || 0), 0));

    return (
        <Box sx={{ width: "100%", backgroundColor: "#fff", p: 2 }}>
            <Container>
                {/* Heading Section */}
                <Typography variant="h5" color="#002060" align="center" fontWeight={600} marginBottom={2}>
                    2025 YTD Net of Hedge P&L Attribution by Fund
                </Typography>

                {/* Loading & Error Handling */}
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <TableContainer component={Paper} sx={{ border: "1px solid #ddd" }}>
                        <Table size="small" sx={{ borderCollapse: "collapse" }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#466675" }}>
                                    <TableCell
                                        sx={{
                                            color: "#ffffff",
                                            fontWeight: "bold",
                                            width: "20px",
                                            border: "1px solid #ddd",
                                            textAlign: "center",
                                        }}
                                    >
                                        Fund
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            color: "#ffffff",
                                            fontWeight: "bold",
                                            width: "20px",
                                            border: "1px solid #ddd",
                                            textAlign: "center",
                                        }}
                                    >
                                        YTD PnL
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            color: "#ffffff",
                                            fontWeight: "bold",
                                            width: "120px",
                                            border: "1px solid #ddd",
                                            textAlign: "center",
                                        }}
                                    >
                                        Hurdle Return
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            color: "#ffffff",
                                            fontWeight: "bold",
                                            width: "120px",
                                            border: "1px solid #ddd",
                                            textAlign: "center",
                                        }}
                                    >
                                        Net PnL
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((row, index) => (
                                    <TableRow key={index} sx={{ backgroundColor: index % 2 ? "#f5f5f5" : "#ffffff" }}>
                                        <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd", textAlign: "center" }}>
                                            <Link to={`/equity/fund/${row.fund}`} style={{ color: "#A52A2A", textDecoration: "none" }} target="_blank">
                                                {row.fund}
                                            </Link>
                                        </TableCell>
                                        <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>{formatNumber(row.pnl)}</TableCell>
                                        <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>{formatNumber(row.hurdle_return)}</TableCell>
                                        <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>{formatNumber(row.net || 0)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow sx={{ backgroundColor: "#91ce89" }}>
                                    <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd", textAlign: "center" }}>Total</TableCell>
                                    <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>{totalPnl}</TableCell>
                                    <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>{totalhurdle_return}</TableCell>
                                    <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>{totalNet}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Render DealStatsMain Component below the table */}
                <DealStatsMain />
            </Container>
        </Box>
    );
};

export default Fundwisedata;
