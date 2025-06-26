import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";

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
}

const formatNumber = (value: number): string => {
    const absValue = Math.abs(value);
    let formattedValue: string;

    if (absValue >= 1e9) {
        formattedValue = `${(absValue / 1e9).toFixed(0)}B`;
    } else if (absValue >= 1e6) {
        formattedValue = `${(absValue / 1e6).toFixed(0)}M`;
    } else if (absValue >= 1e3) {
        formattedValue = `${(absValue / 1e3).toFixed(0)}K`;
    } else {
        formattedValue = absValue.toString();
    }

    return value < 0 ? `-$${formattedValue}` : `$${formattedValue}`;
};

const RegionTableData: React.FC<RegionTableProps> = ({ data, totals }) => {
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
                                    textAlign: "center",
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
                            <TableRow key={region}>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem",textAlign: "center" }}>{region}</TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem", textAlign: "center" }}>{row.Total_Deal_Count}</TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem", textAlign: "center" }}>{formatNumber(row.Total_Deal_Volume)}</TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem", textAlign: "center" }}>{row.Positively_Performing_Deals_Percentage.toFixed(0)}%</TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem", textAlign: "center" }}>{row.Negatively_Performing_Deals_Percentage.toFixed(0)}%</TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem", textAlign: "center" }}>{row.Average_T1M_Abs_Return_of_Positively.toFixed(1)}%</TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem", textAlign: "center" }}>{row.Average_T1M_Abs_Return_of_Negatively.toFixed(1)}%</TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem", textAlign: "center" }}>{row.Expected_Returns_Excess.toFixed(1)}%</TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.875rem", textAlign: "center" }}>{formatNumber(row.Long_Opportunity_Value)}</TableCell>
                            </TableRow>
                        );
                    })}
                    <TableRow>
                        <TableCell sx={{ padding: "4px 8px", fontWeight: "bold", fontSize: "0.875rem", textAlign: "center" }}>Total</TableCell>
                        <TableCell sx={{ padding: "4px 8px", fontWeight: "bold", fontSize: "0.875rem", textAlign: "center" }}>{totals.Total_Deal_Count_Sum}</TableCell>
                        <TableCell sx={{ padding: "4px 8px", fontWeight: "bold", fontSize: "0.875rem", textAlign: "center" }}>{formatNumber(totals.Total_Deal_Volume_Sum)}</TableCell>
                        <TableCell sx={{ padding: "4px 8px", fontWeight: "bold", fontSize: "0.875rem", textAlign: "center" }}>{totals.Total_Postively_Performing_Deals.toFixed(0)}%</TableCell>
                        <TableCell sx={{ padding: "4px 8px", fontWeight: "bold", fontSize: "0.875rem", textAlign: "center" }}>{totals.Total_Negatively_Performing_Deals.toFixed(0)}%</TableCell>
                        <TableCell sx={{ padding: "4px 8px", fontWeight: "bold", fontSize: "0.875rem", textAlign: "center" }}>{totals.Total_Returns_positively.toFixed(1)}%</TableCell>
                        <TableCell sx={{ padding: "4px 8px", fontWeight: "bold", fontSize: "0.875rem", textAlign: "center" }}>{totals.Total_Returns_negatively.toFixed(1)}%</TableCell>
                        <TableCell sx={{ padding: "4px 8px", fontWeight: "bold", fontSize: "0.875rem", textAlign: "center" }}>{totals.Total_Expected_returns_excess.toFixed(1)}%</TableCell>
                        <TableCell sx={{ padding: "4px 8px", fontWeight: "bold", fontSize: "0.875rem" }}>{formatNumber(totals.Total_Long_Opportunity_Value)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default RegionTableData;
