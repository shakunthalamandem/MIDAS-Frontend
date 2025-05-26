import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    CircularProgress,
    Grid,
    Box,
} from "@mui/material";

interface SectorData {
    [key: string]: {
        [metric: string]: number;
    };
}

const SectorWiseTable: React.FC = () => {
    const apiUrl = process.env.REACT_APP_API_URL!;
    const token = localStorage.getItem("access_token");

    const [foData, setFoData] = useState<SectorData | null>(null);
    const [ipoData, setIpoData] = useState<SectorData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchGapAnalysis = async (dealType: string): Promise<SectorData> => {
        const payload = {
            years: [2025],
            period: [],
            deal_type: [dealType],
            fo_type: [],
            broad_region: [],
            gics_sector: [],
            deal_captain: [],
            selected_bank: [],
            filter_type: "gics_sector_from_bloomberg",
        };

        const response = await fetch(`${apiUrl}/api/gap_analysis/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        return data["2025"];
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [foResult, ipoResult] = await Promise.all([
                    fetchGapAnalysis("FO"),
                    fetchGapAnalysis("IPO"),
                ]);
                setFoData(foResult);
                setIpoData(ipoResult);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl, token]);

    const formatValue = (value?: number): string => {
        if (value === undefined || value === null || isNaN(value)) return "N/A";

        const absValue = Math.abs(value);
        const sign = value < 0 ? "-" : "";

        if (absValue >= 1_000_000_000)
            return `${sign}$${(absValue / 1_000_000_000).toFixed(1)}B`;
        if (absValue >= 1_000_000)
            return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`;
        if (absValue >= 1_000)
            return `${sign}$${(absValue / 1_000).toFixed(1)}K`;

        return `${sign}$${absValue.toFixed(2)}`;
    };

    const renderTable = (data: SectorData, title: string) => {
        const entries = Object.entries(data);
        const summaryEntry = entries.find(([key]) => key === "Summary");
        const nonSummaryEntries = entries.filter(([key]) => key !== "Summary");

        const allEntries: [string, { [metric: string]: number }][] = [
            ...nonSummaryEntries,
            ...(summaryEntry ? [summaryEntry] : []),
        ];

        return (
            <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {title}
                </Typography>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>Sector</TableCell>
                                <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>
                                    Monashee Actual Total PnL (Gross)
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>
                                    Model Actual Total PnL (Gross)
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>
                                    Total Gap
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {allEntries.map(([sector, values]) => {
                                const isSummary = sector === "Summary";
                                const monasheeTotal =
                                    (values["Allocation Return"] || 0) + (values["AM Return"] || 0);
                                const modelTotal =
                                    (values["Model Return 1% Allocation"] || 0) +
                                    (values["Model AM Return"] || 0);
                                const gap = monasheeTotal - modelTotal;

                                return (
                                    <TableRow key={sector}>
                                        <TableCell sx={{ fontWeight: isSummary ? "bold" : "normal" }}>
                                            {sector}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: isSummary ? "bold" : "normal" }}>
                                            {formatValue(monasheeTotal)}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: isSummary ? "bold" : "normal" }}>
                                            {formatValue(modelTotal)}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                bgcolor: !isSummary ? "#f8f9cd" : "transparent",
                                                fontWeight: isSummary ? "bold" : "normal",
                                            }}
                                        >
                                            {formatValue(gap)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    if (loading) return <CircularProgress />;

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                {foData && renderTable(foData, "FO Deals")}
            </Grid>
            <Grid item xs={12} md={6}>
                {ipoData && renderTable(ipoData, "IPO Deals")}
            </Grid>
        </Grid>
    );
};

export default SectorWiseTable;
