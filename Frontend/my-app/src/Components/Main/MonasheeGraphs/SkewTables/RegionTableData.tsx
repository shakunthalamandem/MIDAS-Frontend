import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

interface TableData {
    Total_Deal_Count: number;
    Total_Deal_Volume: number;
    Positively_Performing_Deals_Percentage: number;
    Negatively_Performing_Deals_Percentage: number;
    Average_T1M_Abs_Return_of_Positively: number;
    Average_T1M_Abs_Return_of_Negatively: number;
    Expected_Returns_Excess: number;
    Long_Opportunity_Value: number;
}

interface Totals {
    Total_Deal_Count_Sum: number;
    Total_Deal_Volume_Sum: number;
    Total_Postively_Performing_Deals: number;
    Total_Negatively_Performing_Deals: number;
    Total_Returns_positively: number;
    Total_Returns_negatively: number;
    Total_Expected_returns_excess: number;
    Total_Long_Opportunity_Value: number;
}

interface RegionTableProps {
    data: { [region: string]: TableData } | null;
    totals: Totals | null;
    onRowClick?: (region: string) => void;
}

const formatNumber = (value: number, decimals: number = 0): string => {
    const absValue = Math.abs(value);
    let formattedValue: string;

    if (absValue >= 1e9) formattedValue = `${(absValue / 1e9).toFixed(decimals)}B`;
    else if (absValue >= 1e6) formattedValue = `${(absValue / 1e6).toFixed(decimals)}M`;
    else if (absValue >= 1e3) formattedValue = `${(absValue / 1e3).toFixed(decimals)}K`;
    else formattedValue = absValue.toFixed(decimals);

    return value < 0 ? `-$${formattedValue}` : `$${formattedValue}`;
};

const RegionTableData: React.FC<RegionTableProps> = ({ data, totals, onRowClick }) => {
    if (!data || !totals) {
        return <div>Loading or No Data Available</div>;
    }

    const fixedOrder = ["US", "EMEA", "APAC", "Non-US America"];

    const columns = [
        "Region",
        "Total Deal Count",
        "Total Deal Volume ($)",
        "% of Positively Performing Deals",
        "% of Negatively Performing Deals",
        "Weighted Avg T+1M Excess Return (Positive Deals)",
        "Weighted Avg T+1M Excess Return (Negative Deals)",
        "Expected Returns Excess",
        "Opportunity Value (T + 1M Excess)",
    ];

    return (
        <TableContainer component={Paper} sx={{ marginTop: 2, marginBottom: 4 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        {columns.map((column) => (
                            <TableCell
                                key={column}
                                sx={{
                                    fontWeight: "bold",
                                    textAlign: "left",
                                    padding: "4px 8px",
                                    fontSize: "0.875rem",
                                    bgcolor: "#002060",
                                    color: "#FFFFFF",
                                }}
                            >
                                {column}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {fixedOrder.map((region) => {
                        const row = data[region];
                        if (!row) return null;

                        return (
                            <TableRow key={region} hover>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem", }}>
                                    {region}
                                </TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem", }}>
                                    {row.Total_Deal_Count}
                                </TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem", }}>
                                    {formatNumber(row.Total_Deal_Volume)}
                                </TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem", }}>
                                    {row.Positively_Performing_Deals_Percentage.toFixed(0)}%
                                </TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem", }}>
                                    {row.Negatively_Performing_Deals_Percentage.toFixed(0)}%
                                </TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem", }}>
                                    {row.Average_T1M_Abs_Return_of_Positively.toFixed(1)}%
                                </TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem", }}>
                                    {row.Average_T1M_Abs_Return_of_Negatively.toFixed(1)}%
                                </TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem", }}>
                                    {row.Expected_Returns_Excess.toFixed(1)}%
                                </TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem" }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <span>{formatNumber(row.Long_Opportunity_Value, 1)}</span>
                                        <Box sx={{ cursor: "pointer", pl: 1 }} onClick={() => onRowClick?.(region)}>
                                            <MoreHorizIcon fontSize="small" />
                                        </Box>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    <TableRow>
                        <TableCell sx={{ fontWeight: "bold", }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: "bold", }}>{totals.Total_Deal_Count_Sum}</TableCell>
                        <TableCell sx={{ fontWeight: "bold", }}>{formatNumber(totals.Total_Deal_Volume_Sum)}</TableCell>
                        <TableCell sx={{ fontWeight: "bold", }}>{totals.Total_Postively_Performing_Deals.toFixed(0)}%</TableCell>
                        <TableCell sx={{ fontWeight: "bold", }}>{totals.Total_Negatively_Performing_Deals.toFixed(0)}%</TableCell>
                        <TableCell sx={{ fontWeight: "bold", }}>{totals.Total_Returns_positively.toFixed(1)}%</TableCell>
                        <TableCell sx={{ fontWeight: "bold", }}>{totals.Total_Returns_negatively.toFixed(1)}%</TableCell>
                        <TableCell sx={{ fontWeight: "bold", }}>{totals.Total_Expected_returns_excess.toFixed(1)}%</TableCell>
                        <TableCell sx={{ fontWeight: "bold", }}>{formatNumber(totals.Total_Long_Opportunity_Value, 1)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default RegionTableData;
