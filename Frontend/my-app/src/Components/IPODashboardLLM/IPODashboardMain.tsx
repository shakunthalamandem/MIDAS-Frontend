import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Grid,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    List,
    ListItem,
    CircularProgress,
} from "@mui/material";
import FinancialForecastTable from "./IPOFinancialTableMain";
import IPODashboardMainTable from "./IPODashboardMainTable";

const cardStyle = {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: 2,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    padding: 2.5,
    minHeight: 320,
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
};

const formatPriceRange = (lower: number | null, upper: number | null) => {
    if (lower && upper) return `$${lower} - $${upper}`;
    if (lower) return `$${lower}`;
    if (upper) return `$${upper}`;
    return "N/A";
};

const IPODashboardMain: React.FC = () => {
    const [ipoData, setIpoData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const token = localStorage.getItem("access_token");
                if (!apiUrl) throw new Error("API URL is not defined in environment variables");

                const response = await fetch(`${apiUrl}/api/writeup_data/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                    body: JSON.stringify({ ticker: "CRWV" }),
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || `HTTP error! status: ${response.status}`);
                }

                const jsonData = await response.json();
                setIpoData(jsonData);
            } catch (err: any) {
                console.error("Failed to fetch IPO data", err);
                setError("Failed to fetch IPO data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ px: 2 }}>
            {ipoData && (
                <>
                    <Typography variant="h5" gutterBottom>
                        {ipoData.company_name} ({ipoData.ticker_name} | {ipoData.exchange})
                    </Typography>

                    {/* Info Table */}
                    <Paper elevation={1} sx={{ overflowX: "auto", my: 3 }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: "#f5f6fa" }}>
                                <TableRow>
                                    {[
                                        "Pricing Date",
                                        "Price Range",
                                        "Deal Size",
                                        "Industry",
                                        "Shares Offered",
                                        "No. Shares Out (NoSH)",
                                        "Established",
                                        "Bookrunners",
                                    ].map((header) => (
                                        <TableCell
                                            key={header}
                                            sx={{
                                                fontWeight: 600,
                                                textAlign: "center",
                                                fontSize: 15,
                                                color: "#002060",
                                            }}
                                        >
                                            {header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell align="center">{ipoData.pricing_date || "N/A"}</TableCell>
                                    <TableCell align="center">
                                        {formatPriceRange(ipoData.lower_bound, ipoData.upper_bound)}
                                    </TableCell>
                                    <TableCell align="center">
                                        {ipoData.deal_size ? `$${ipoData.deal_size.toLocaleString()}` : "N/A"}
                                    </TableCell>
                                    <TableCell align="center">{ipoData.industry || "N/A"}</TableCell>
                                    <TableCell align="center">
                                        {ipoData.shares_offered ? ipoData.shares_offered.toLocaleString() : "N/A"}
                                    </TableCell>
                                    <TableCell align="center">
                                        {ipoData.nosh ? ipoData.nosh.toLocaleString() : "N/A"}
                                    </TableCell>
                                    <TableCell align="center">{ipoData.established_year || "N/A"}</TableCell>
                                    <TableCell align="center">
                                        {ipoData.bookrunners ? ipoData.bookrunners.join(", ") : "N/A"}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Paper>

                    {/* Cards Section */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {[
                            { title: "Business Overview", data: ipoData.business_overview },
                            { title: "Key Highlights", data: ipoData.key_highlights },
                            { title: "Strengths", data: ipoData.strengths },
                            { title: "Concerns", data: ipoData.concerns },
                            { title: "Principal Stockholders (pre-IPO)", data: ipoData.principal_stockholders_preipo },
                            { title: "Key Management Personnel", data: ipoData.key_management_personnel },
                        ].map((section, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <Box sx={cardStyle}>
                                    <Typography variant="h6" sx={{ color: "#002060", mb: 1 }}>
                                        {section.title}
                                    </Typography>
                                    <List>
                                        {section.data?.map((item: string, idx: number) => (
                                            <ListItem key={idx} sx={{ pl: 2, py: 0.5 }}>
                                                {item}
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </Grid>
                        ))}

                        {/* Full width components */}
                        <Grid item xs={12}>
                            <Box sx={{ ...cardStyle, p: 0 }}>
                                <FinancialForecastTable defaultTicker="CRWV" />
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ ...cardStyle, p: 0 }}>
                                <IPODashboardMainTable />
                            </Box>
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
};

export default IPODashboardMain;
