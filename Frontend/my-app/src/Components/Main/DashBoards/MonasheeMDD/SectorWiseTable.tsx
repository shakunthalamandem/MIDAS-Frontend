import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Box,
    Typography,
    Grid,
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
        if (value === undefined || value === null || isNaN(value)) return "-";

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

    const addUtilitiesRowIfMissing = (data: SectorData | null): SectorData | null => {
        if (!data) return data;

        if (!data["Utilities"]) {
            return {
                ...data,
                Utilities: {
                    "Allocation Return": NaN,
                    "AM Return": NaN,
                    "Model Return 1% Allocation": NaN,
                    "Model AM Return": NaN,
                },
            };
        }
        return data;
    };

    const renderTable = (data: SectorData | null, title: string) => {
        if (!data) return null;

        const dataWithUtilities = title === "IPO Deals" ? addUtilitiesRowIfMissing(data) : data;

        if (!dataWithUtilities) return null;

        const entries = Object.entries(dataWithUtilities);
        const summaryEntry = entries.find(([key]) => key === "Summary");
        const nonSummaryEntries = entries.filter(([key]) => key !== "Summary");

        const allEntries: [string, { [metric: string]: number }][] = [
            ...nonSummaryEntries,
            ...(summaryEntry ? [summaryEntry] : []),
        ];

        return (
            <>
                <TableHead>
                    <TableRow>
                        <TableCell
                            colSpan={4}
                            sx={{
                                backgroundColor: "#002060",
                                color: "#fff",
                                fontWeight: "bold",
                                textAlign: "center",
                                fontSize: "1rem",
                            }}
                        >
                            {title}
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableHead>
                    <TableRow sx={{ backgroundColor: "#466675" }}>
                        <TableCell
                            sx={{ color: "#fff", fontWeight: "bold", borderRight: "1px solid #ccc" }}
                        >
                            Sector
                        </TableCell>
                        <TableCell
                            sx={{ color: "#fff", fontWeight: "bold", borderRight: "1px solid #ccc" }}
                        >
                            Monashee Actual Total PnL (Gross)
                        </TableCell>
                        <TableCell
                            sx={{ color: "#fff", fontWeight: "bold", borderRight: "1px solid #ccc" }}
                        >
                            Model Actual Total PnL (Gross)
                        </TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Total Gap</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {allEntries.map(([sector, values]) => {
                        const isSummary = sector === "Summary";

                        const monasheeTotal =
                            isNaN(values["Allocation Return"] || NaN) || isNaN(values["AM Return"] || NaN)
                                ? NaN
                                : (values["Allocation Return"] || 0) + (values["AM Return"] || 0);

                        const modelTotal =
                            isNaN(values["Model Return 1% Allocation"] || NaN) ||
                            isNaN(values["Model AM Return"] || NaN)
                                ? NaN
                                : (values["Model Return 1% Allocation"] || 0) +
                                  (values["Model AM Return"] || 0);

                        const gap = isNaN(monasheeTotal) || isNaN(modelTotal) ? NaN : monasheeTotal - modelTotal;

                        return (
                            <TableRow
                                key={sector}
                                sx={{
                                    backgroundColor: isSummary ? "#7bcf60" : "inherit",
                                }}
                            >
                                <TableCell
                                    sx={{
                                        fontWeight: isSummary ? "bold" : "normal",
                                        borderRight: "1px solid #ccc",
                                    }}
                                >
                                    {sector}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: isSummary ? "bold" : "normal",
                                        borderRight: "1px solid #ccc",
                                    }}
                                >
                                    {isNaN(monasheeTotal) ? "-" : formatValue(monasheeTotal)}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: isSummary ? "bold" : "normal",
                                        borderRight: "1px solid #ccc",
                                    }}
                                >
                                    {isNaN(modelTotal) ? "-" : formatValue(modelTotal)}
                                </TableCell>
                                <TableCell sx={{ fontWeight: isSummary ? "bold" : "normal" }}>
                                    {isNaN(gap) ? "-" : formatValue(gap)}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </>
        );
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Typography
                variant="h6"
                sx={{
                    mb: 2,
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "#002060",
                }}
            >
                Sector Wise IPO and FO Data for 2025
            </Typography>

            <Grid container spacing={0}>
                <Grid item xs={12} md={6}>
                    <TableContainer component={Paper}>
                        <Table size="small">{renderTable(foData, "FO Deals")}</Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TableContainer component={Paper}>
                        <Table size="small">{renderTable(ipoData, "IPO Deals")}</Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SectorWiseTable;
