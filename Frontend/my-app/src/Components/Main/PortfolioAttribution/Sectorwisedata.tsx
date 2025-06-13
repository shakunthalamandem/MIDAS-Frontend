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
const formatNumber = (value: number) => {
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    let formattedValue;

    if (absValue >= 1_000) {
        formattedValue = (absValue / 1_000).toFixed(0) + "K";
    } else {
        formattedValue = absValue.toFixed(2);
    }

    return isNegative ? `-$${formattedValue}` : `$${formattedValue}`;
};
interface RegionData {
    APAC: number;
    EMEA: number;
    US: number;
    custom_group_2: string;
}

interface SectorData {
    custom_group_2: string;
    APAC: number;
    EMEA: number;
    US: number;
}

const Sectorwisedata: React.FC = () => {
    const [data, setData] = useState<SectorData[]>([]);
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
                    body: JSON.stringify({ filter_type: "custom_group_2" }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch sector-wise data");
                }

                const result = await response.json();

                const formattedData: SectorData[] = Object.entries(result).map(
                    ([sector, regions]: [string, unknown]) => {
                        const typedRegions = regions as RegionData;

                        return {
                            custom_group_2: typedRegions.custom_group_2,
                            APAC: typedRegions.APAC || 0,
                            EMEA: typedRegions.EMEA || 0,
                            US: typedRegions.US || 0,
                        };
                    }
                );

                setData(formattedData);
                setLoading(false);
            } catch (error: any) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl, token]);

    // Compute total PnL for each row
    const computeTotalPnl = (row: SectorData) => row.APAC + row.EMEA + row.US;

    // Compute totals for APAC, US, EMEA, and YTD
    const totalAPAC = data.reduce((sum, row) => sum + row.APAC, 0);
    const totalUS = data.reduce((sum, row) => sum + row.US, 0);
    const totalEMEA = data.reduce((sum, row) => sum + row.EMEA, 0);
    const totalPnl = data.reduce((sum, row) => sum + computeTotalPnl(row), 0);

    return (
        <Box sx={{ width: "100%", backgroundColor: "#fff", p: 2 }}>
            <Container>
                <Typography
                    variant="h5"
                    color="#002060"
                    align="center"
                    fontWeight={600}
                    marginBottom={2}
                >
                    Net $P&L Attribution by Sector
                </Typography>

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <TableContainer component={Paper} sx={{ borderRadius: "10px", overflow: "hidden" }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#466675" }}>
                                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>Sector</TableCell>
                                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>APAC</TableCell>
                                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>US</TableCell>
                                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>EMEA</TableCell>
                                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>YTD</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.length > 0 ? (
                                    data.map((row, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{ backgroundColor: index % 2 ? "#f5f5f5" : "#ffffff" }}
                                        >
                                            <TableCell sx={{ color: "#A52A2A", fontWeight: "bold" }}>
                                                {row.custom_group_2}
                                            </TableCell>
                                            <TableCell>{formatNumber(row.APAC)}</TableCell>
                                            <TableCell>{formatNumber(row.US)}</TableCell>
                                            <TableCell>{formatNumber(row.EMEA)}</TableCell>
                                            <TableCell>{formatNumber(computeTotalPnl(row))}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            No data available
                                        </TableCell>
                                    </TableRow>
                                )}
                                {/* Totals Row */}
                                <TableRow sx={{ backgroundColor: "#91ce89", fontWeight: "bold" }}>
                                    <TableCell>Total</TableCell>
                                    <TableCell>{formatNumber(totalAPAC)}</TableCell>
                                    <TableCell>{formatNumber(totalUS)}</TableCell>
                                    <TableCell>{formatNumber(totalEMEA)}</TableCell>
                                    <TableCell>{formatNumber(totalPnl)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Container>
        </Box>
    );
};

export default Sectorwisedata;
