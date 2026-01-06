import React, { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, CircularProgress, Typography, Container, Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent
} from "@mui/material";


type AssetData = {
    asset_type: string;
    [month: string]: number | string;
};

type ApiResponse = {
    [fundName: string]: {
        [assetType: string]: AssetData;
    };
};

type YearlyApiResponse = {
    [year: string]: ApiResponse;
};

interface TableRowData {
    fundName: string;
    assetType: string;
    values: { [month: string]: number };
}

interface DetailedFundTableProps {
    selectedYear: string;
    onYearChange: (year: string) => void;
}

// Custom asset order
const assetOrder = [
    "Equities", "Convertible Bond", "Corporate Bond", "Cash", "Warrants", "Futures"
];

const formatCurrency = (value: number): string => {
    const absValue = Math.abs(value);
    const suffix = absValue >= 1_000_000 ? "M" : absValue >= 1_000 ? "K" : "";
    const divisor = suffix === "M" ? 1_000_000 : suffix === "K" ? 1_000 : 1;
    const formatted = (absValue / divisor).toFixed(2);
    return `${value < 0 ? "-" : ""}$${formatted}${suffix}`;
};

const yearOptions = ["2025", "2026"];

const DetailedFundTable: React.FC<DetailedFundTableProps> = ({ selectedYear, onYearChange }) => {
    const [data, setData] = useState<TableRowData[]>([]);
    const [months, setMonths] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");




    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${apiUrl}/api/pnl/fund/`, {
                    method: "POST",
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ year: Number(selectedYear) }),
                });
                const result: YearlyApiResponse = await res.json();
                const yearData = result[selectedYear] || {};

                const rows: TableRowData[] = [];
                const monthSet: Set<string> = new Set();

                for (const [fundName, assetMap] of Object.entries(yearData)) {
                    for (const [assetType, assetData] of Object.entries(assetMap)) {
                        const { asset_type, ...rest } = assetData;
                        const monthValues = rest as { [month: string]: number };

                        const isAllZero = Object.values(monthValues).every((val) => !val || val === 0);
                        if (!isAllZero) {
                            Object.keys(monthValues).forEach((m) => monthSet.add(m));
                            rows.push({ fundName, assetType, values: monthValues });
                        }
                    }
                }

                const orderedMonths = Array.from(monthSet).sort((a, b) => {
                    const order = [
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December", "YTD"
                    ];
                    return order.indexOf(a) - order.indexOf(b);
                });

                setMonths(orderedMonths);
                setData(rows);
            } catch (err) {
                console.error("Data fetch error", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl, token, selectedYear]);

    const cellBorder = { border: "1px solid black", textAlign: "center" };
    const overallRowBgColor = "#fde8b7";

    const handleYearChange = (event: SelectChangeEvent<string>) => {
        onYearChange(event.target.value);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ position: "relative", mt: 1, mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#002060", textAlign: "center" }}>
                    Fund-Wise P&L Attribution
                </Typography>
                <Box
                    sx={{
                        position: "absolute",
                        right: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                    }}
                >
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel id="detailed-fund-year-select-label">Year</InputLabel>
                        <Select
                            labelId="detailed-fund-year-select-label"
                            value={selectedYear}
                            label="Year"
                            onChange={handleYearChange}
                        >
                            {yearOptions.map((year) => (
                                <MenuItem key={year} value={year}>
                                    {year}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ mt: 1, mb: 4, borderRadius: 2, boxShadow: 3, overflow: "auto", border: "1px solid #000" }}>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Table size="small" sx={{ borderCollapse: "collapse" }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#002060" }}>
                                <TableCell sx={{ color: "#ffffff", ...cellBorder }}><b>Fund</b></TableCell>
                                <TableCell sx={{ color: "#ffffff", ...cellBorder }}><b>Asset Type</b></TableCell>
                                {months.map((month) => (
                                    <TableCell key={month} align="center" sx={{ color: "#ffffff", ...cellBorder }}>
                                        <b>{month}</b>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(() => {
                                const groupedByFund: Record<string, TableRowData[]> = {};
                                data.forEach((row) => {
                                    if (!groupedByFund[row.fundName]) groupedByFund[row.fundName] = [];
                                    groupedByFund[row.fundName].push(row);
                                });

                                const overallTotals: { [month: string]: number } = {};
                                months.forEach((m) => (overallTotals[m] = 0));

                                const tableRows: JSX.Element[] = [];

                                const sortedFundNames = Object.keys(groupedByFund).sort((a, b) =>
                                    a.localeCompare(b)
                                );

                                sortedFundNames.forEach((fundName) => {
                                    const fundRows = groupedByFund[fundName];

                                    // Sort fundRows by asset order
                                    const sortedFundRows = fundRows.sort((a, b) => {
                                        const indexA = assetOrder.indexOf(a.assetType);
                                        const indexB = assetOrder.indexOf(b.assetType);
                                        const orderA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
                                        const orderB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
                                        return orderA - orderB;
                                    });

                                    const assetTotals: { [month: string]: number } = {};
                                    months.forEach((m) => (assetTotals[m] = 0));

                                    sortedFundRows.forEach((row, idx) => {
                                        months.forEach((m) => {
                                            assetTotals[m] += row.values[m] ?? 0;
                                            overallTotals[m] += row.values[m] ?? 0;
                                        });

                                        tableRows.push(
                                            <TableRow key={`${fundName}-${row.assetType}`}>
                                                {idx === 0 && (
                                                    <TableCell
                                                        sx={{ ...cellBorder, fontWeight: "bold" }}
                                                        rowSpan={sortedFundRows.length + 1}
                                                    >
                                                        {fundName}
                                                    </TableCell>
                                                )}
                                                <TableCell sx={cellBorder}>{row.assetType}</TableCell>
                                                {months.map((m) => (
                                                    <TableCell key={m} sx={cellBorder}>
                                                        {formatCurrency(row.values[m] ?? 0)}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        );
                                    });

                                    tableRows.push(
                                        <TableRow key={`${fundName}-sum`} sx={{ backgroundColor: "rgb(145, 206, 137)" }}>
                                            <TableCell sx={{ ...cellBorder, fontWeight: "bold" }}>Sum</TableCell>
                                            {months.map((m) => (
                                                <TableCell key={m} sx={cellBorder}>
                                                    <b>{formatCurrency(assetTotals[m])}</b>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                });

                                tableRows.push(
                                    <TableRow key="overall-total" sx={{ backgroundColor: overallRowBgColor }}>
                                        <TableCell colSpan={2} sx={{ ...cellBorder, fontWeight: "bold" }}>
                                            Overall Total
                                        </TableCell>
                                        {months.map((m) => (
                                            <TableCell key={m} sx={cellBorder}>
                                                <b>{formatCurrency(overallTotals[m])}</b>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );

                                return tableRows;
                            })()}
                        </TableBody>


                    </Table>
                )}
            </TableContainer>
        </Container>
    );
};

export default DetailedFundTable;
