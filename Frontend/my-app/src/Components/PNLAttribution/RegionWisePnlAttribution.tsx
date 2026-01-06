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
    Typography,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Box,
} from "@mui/material";

type AssetData = {
    asset_type: string;
    [month: string]: number | string;
};

type RegionData = {
    [assetType: string]: AssetData;
};

type ApiResponse = {
    [region: string]: RegionData;
};

type YearlyApiResponse = {
    [year: string]: ApiResponse;
};

interface TableRowData {
    assetType: string;
    region: string;
    values: { [month: string]: number };
}

interface RegionWisePnlAttributionProps {
    selectedYear: string;
    onYearChange: (year: string) => void;
}

const orderedRegions = ["US", "EMEA", "APAC", "Non-US America"];
const assetOrder = [ "Equities","Convertible Bond","Corporate Bond","Cash",  "Warrants", "Futures"];

const formatCurrency = (value: number): string => {
    const absValue = Math.abs(value);
    const suffix = absValue >= 1_000_000 ? "M" : absValue >= 1_000 ? "K" : "";
    const divisor = suffix === "M" ? 1_000_000 : suffix === "K" ? 1_000 : 1;
    const formatted = (absValue / divisor).toFixed(2);
    return `${value < 0 ? "-" : ""}$${formatted}${suffix}`;
};

const yearOptions = ["2025", "2026"];

const RegionWisePnlAttribution: React.FC<RegionWisePnlAttributionProps> = ({
    selectedYear,
    onYearChange,
}) => {
    const [data, setData] = useState<TableRowData[]>([]);
    const [months, setMonths] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${apiUrl}/api/regionwisepnl/`, {
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

                for (const region of orderedRegions) {
                    const regionData = yearData[region];
                    if (!regionData) continue;

                    for (const assetType in regionData) {
                        const fundData = regionData[assetType] as Record<string, number>;

                        const isAllZero = Object.values(fundData).every(
                            (value) => !value || value === 0
                        );

                        if (!isAllZero) {
                            Object.keys(fundData).forEach((month) => monthSet.add(month));
                            rows.push({
                                assetType,
                                region,
                                values: fundData,
                            });
                        }
                    }
                }

                const sortedMonths = Array.from(monthSet).sort((a, b) => {
                    const order = [
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November",
                        "December", "YTD",
                    ];
                    return order.indexOf(a) - order.indexOf(b);
                });

                setMonths(sortedMonths);
                setData(rows);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl, token, selectedYear]);

    const cellBorder = { border: "1px solid black", textAlign: "center" };
    const totalRowBgColor = "rgb(145, 206, 137)";
    const overallRowBgColor = "#fde8b7";
    const handleYearChange = (event: SelectChangeEvent<string>) => {
        onYearChange(event.target.value);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ position: "relative", mt: 1, mb: 1 }}>
                <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#002060", textAlign: "center" }}
                >
                    Region-Wise P&L Attribution
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
                        <InputLabel id="region-year-select-label">Year</InputLabel>
                        <Select
                            labelId="region-year-select-label"
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


            <TableContainer
                component={Paper}
                sx={{
                    mt: 1,
                    mb: 4,
                    borderRadius: 2,
                    boxShadow: 3,
                    overflow: "auto",
                    border: "1px solid #000",
                }}
            >
                {loading ? (
                    <CircularProgress sx={{ m: 2 }} />
                ) : (
                    <Table size="small" sx={{ borderCollapse: "collapse" }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#002060" }}>
                                <TableCell sx={{ color: "#ffffff", ...cellBorder }}><b>Region</b></TableCell>
                                <TableCell sx={{ color: "#ffffff", ...cellBorder }}><b>Asset Type</b></TableCell>
                                {months.map((month) => (
                                    <TableCell key={month} sx={{ color: "#ffffff", ...cellBorder }}><b>{month}</b></TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(() => {
                                const grouped = data.reduce<Record<string, TableRowData[]>>((acc, row) => {
                                    if (!acc[row.region]) acc[row.region] = [];
                                    acc[row.region].push(row);
                                    return acc;
                                }, {});

                                const rows: JSX.Element[] = [];
                                const overallTotals: { [month: string]: number } = {};
                                months.forEach((m) => (overallTotals[m] = 0));

                                orderedRegions.forEach((region) => {
                                    const regionRowsUnordered = grouped[region];
                                    if (!regionRowsUnordered) return;

                                    const regionRows = [...regionRowsUnordered].sort(
                                        (a, b) => assetOrder.indexOf(a.assetType) - assetOrder.indexOf(b.assetType)
                                    );

                                    const totals: { [month: string]: number } = {};
                                    months.forEach((month) => {
                                        totals[month] = regionRows.reduce(
                                            (sum, row) => sum + (row.values[month] ?? 0),
                                            0
                                        );
                                        overallTotals[month] += totals[month];
                                    });


                                    regionRows.forEach((row, idx) => {
                                        rows.push(
                                            <TableRow key={`${region}-${idx}`}>
                                                {idx === 0 && (
                                                    <TableCell
                                                        rowSpan={regionRows.length + 1}
                                                        sx={{ fontWeight: "bold", ...cellBorder }}
                                                    >
                                                        {region}
                                                    </TableCell>
                                                )}
                                                <TableCell sx={cellBorder}>{row.assetType}</TableCell>
                                                {months.map((month) => (
                                                    <TableCell key={month} sx={cellBorder}>
                                                        {formatCurrency(row.values[month] ?? 0)}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        );
                                    });

                                    rows.push(
                                        <TableRow key={`${region}-total`} sx={{ backgroundColor: totalRowBgColor }}>
                                            <TableCell colSpan={1} sx={cellBorder}><b>Sum</b></TableCell>
                                            {months.map((month) => (
                                                <TableCell key={month} sx={cellBorder}>
                                                    <b>{formatCurrency(totals[month])}</b>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                });

                                rows.push(
                                    <TableRow key="overall-total" sx={{ backgroundColor: overallRowBgColor }}>
                                        <TableCell colSpan={2} sx={{ ...cellBorder, fontWeight: "bold" }}>
                                            Overall Total
                                        </TableCell>
                                        {months.map((month) => (
                                            <TableCell key={month} sx={cellBorder}>
                                                <b>{formatCurrency(overallTotals[month])}</b>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                                return rows;
                            })()}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>
        </Container>
    );
};

export default RegionWisePnlAttribution;
