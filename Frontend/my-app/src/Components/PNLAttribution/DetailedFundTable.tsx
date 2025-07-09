import React, { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, CircularProgress, Typography, Container, IconButton, Box
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

type AssetData = {
    asset_type: string;
    [month: string]: number | string;
};

type ApiResponse = {
    [fundName: string]: {
        [assetType: string]: AssetData;
    };
};

interface TableRowData {
    fundName: string;
    assetType: string;
    values: { [month: string]: number };
}

const formatCurrency = (value: number): string => {
    const absValue = Math.abs(value);
    const suffix = absValue >= 1_000_000 ? "M" : absValue >= 1_000 ? "K" : "";
    const divisor = suffix === "M" ? 1_000_000 : suffix === "K" ? 1_000 : 1;
    const formatted = (absValue / divisor).toFixed(2);
    return `${value < 0 ? "-" : ""}$${formatted}${suffix}`;
};

const DetailedFundTable: React.FC = () => {
    const [data, setData] = useState<TableRowData[]>([]);
    const [months, setMonths] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());

    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    const collapsedOnlyAssets = ["Cash", "Warrants", "Futures"];

    const toggleExpand = (assetType: string) => {
        setExpandedAssets((prev) => {
            const updated = new Set(prev);
            if (updated.has(assetType)) updated.delete(assetType);
            else updated.add(assetType);
            return updated;
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${apiUrl}/api/pnl/fund/`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                        "Content-Type": "application/json",
                    },
                });
                const result: ApiResponse = await res.json();

                const rows: TableRowData[] = [];
                const monthSet: Set<string> = new Set();

                for (const [fundName, assetMap] of Object.entries(result)) {
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
    }, [apiUrl, token]);

    const cellBorder = { border: "1px solid black", textAlign: "center" };
    const totalRowBgColor = "rgb(145, 206, 137)";
    const overallRowBgColor = "#fde8b7";

    return (
        <Container>
            <Typography variant="h6" sx={{ mt: 4, mb: 1, fontWeight: "bold", color: "#002060", textAlign: "center" }}>
                 Fund-Wise P&L Attribution
            </Typography>

            <TableContainer component={Paper} sx={{ mt: 4, mb: 4, borderRadius: 2, boxShadow: 3, overflow: "auto", border: "1px solid #000" }}>
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
                                    const assetTotals: { [month: string]: number } = {};
                                    months.forEach((m) => (assetTotals[m] = 0));

                                    fundRows.forEach((row, idx) => {
                                        months.forEach((m) => {
                                            assetTotals[m] += row.values[m] ?? 0;
                                            overallTotals[m] += row.values[m] ?? 0;
                                        });

                                        tableRows.push(
                                            <TableRow key={`${fundName}-${row.assetType}`}>
                                                {idx === 0 && (
                                                    <TableCell
                                                        sx={{ ...cellBorder, fontWeight: "bold" }}
                                                        rowSpan={fundRows.length + 1}
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
