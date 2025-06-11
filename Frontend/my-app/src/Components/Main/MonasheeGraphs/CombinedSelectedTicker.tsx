import React, { useEffect, useState } from "react";
import {
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
    Box,
} from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import axios from "axios";
import MDDSearchSummary from "../MonasheeDeals/MddGraphs/MDDSearchSummary";
import { ApiResponse, formatDate, formatNumber, SelectedTickerProps } from "./tickerUtils";

; // Adjust path as needed

const ArrowValue = ({ value }: { value: number | null | undefined }) => {
    if (value === null || value === undefined) return <>N/A</>;

    const color = value > 0 ? "green" : value < 0 ? "red" : "black";
    const Icon = value > 0 ? ArrowDropUpIcon : value < 0 ? ArrowDropDownIcon : ArrowDropDownIcon;

    return (
        <span style={{ color, display: "flex", alignItems: "center" }}>
            {value.toFixed(2)}%
            <Icon sx={{ color, ml: 0.5, fontSize: 20 }} />
        </span>
    );
};

const CombinedSelectedTicker: React.FC<SelectedTickerProps> = ({ ticker }) => {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<any>(null);

    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    useEffect(() => {
        if (!ticker) return;

        setLoading(true);
        setError(null);

        axios
            .post<ApiResponse>(
                `${apiUrl}/api/mdd_dealogic_search_ticker/`,
                { ticker },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                }
            )
            .then((res) => {
                setData(res.data);
                setSummary(res.data.mdd_data.summary);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to fetch data");
                setLoading(false);
            });
    }, [ticker, apiUrl, token]);

    if (loading)
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );

    if (error)
        return (
            <Typography color="error" mt={4} textAlign="center">
                {error}
            </Typography>
        );

    if (!data) return null;
    return (
        <Box
            sx={{
                width: "100",
                minHeight: "100vh",
                padding: 3,
                bgcolor: "#fafafa",
                overflowX: "hidden",
            }}
        >
            <Grid container spacing={3}>
                {/* === Dealogic Data === */}
                <Grid item xs={10} md={6}>
                    {data.dealogic_data?.data?.length > 0 ? (
                        <>
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}
                            >
                                Historical Deals Overview for{" "}
                                <span style={{ color: "#ff6005", fontStyle: "italic" }}>
                                    {ticker} - {data.dealogic_data?.data?.length} deals
                                </span>
                            </Typography>

                            {data.dealogic_data.data.map((deal, idx) => (
                                <Paper
                                    key={idx}
                                    sx={{ mb: 3, p: 2, bgcolor: "#ffffff", borderRadius: 1 }}
                                    elevation={1}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ textAlign: "center", fontWeight: "bold", mb: 1 }}
                                    >
                                        Deal Information for{" "}
                                        <span style={{ color: "#0073E6" }}>{ticker || "N/A"}</span> on{" "}
                                        <span style={{ color: "#0073E6" }}>{formatDate(deal.pricing_date)}</span>
                                    </Typography>

                                    <Grid container spacing={2}>
                                        {/* Left Table */}
                                        <Grid item xs={12} md={6}>
                                            <TableContainer>
                                                <Table size="small" aria-label="Dealogic Left Table">
                                                    <TableBody>
                                                        {[
                                                            { label: "Pricing Date", value: deal.pricing_date || "N/A" },
                                                            { label: "Issuer Name", value: deal.issuer_name || "N/A" },
                                                            { label: "Ticker Symbol", value: deal.ticker_symbol || "N/A" },
                                                            { label: "GICS Sector", value: deal.gics_sector || "N/A" },
                                                            { label: "Region", value: deal.broad_region || "N/A" },
                                                            { label: "Deal Type", value: deal.deal_type || "N/A" },
                                                            {
                                                                label: "Deal Size",
                                                                value:
                                                                    deal.deal_value != null
                                                                        ? `$${Number(deal.deal_value).toLocaleString()}`
                                                                        : "N/A",
                                                            },
                                                        ].map((row, i) => (
                                                            <TableRow
                                                                key={i}
                                                                sx={{
                                                                    backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#ffffff",
                                                                    "&:hover": { backgroundColor: "#e0f7fa" },
                                                                }}
                                                            >
                                                                <TableCell
                                                                    sx={{
                                                                        border: "1px solid #ccc",
                                                                        fontWeight: "bold",
                                                                        color: "#333",
                                                                    }}
                                                                >
                                                                    {row.label}
                                                                </TableCell>
                                                                <TableCell sx={{ border: "1px solid #ccc" }}>{row.value}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>

                                        {/* Right Table */}
                                        <Grid item xs={12} md={6}>
                                            <TableContainer>
                                                <Table size="small" aria-label="Dealogic Right Table">
                                                    <TableBody>
                                                        {[
                                                            {
                                                                label: "Issue / Price",
                                                                value: formatNumber(deal.issue_offer_price) || "N/A",
                                                            },
                                                            {
                                                                label: "T+1 Day Returns",
                                                                value:
                                                                    deal.t_plus_1d_return !== undefined &&
                                                                        deal.t_plus_1d_return !== null ? (
                                                                        <span
                                                                            style={{
                                                                                color: deal.t_plus_1d_return < 0 ? "red" : "green",
                                                                                display: "inline-flex",
                                                                                alignItems: "center",
                                                                            }}
                                                                        >
                                                                            {deal.t_plus_1d_return < 0 ? "-" : ""}
                                                                            {Math.abs(deal.t_plus_1d_return).toFixed(2)}%
                                                                            {deal.t_plus_1d_return < 0 ? (
                                                                                <ArrowDropDownIcon sx={{ color: "red", ml: 0.5, fontSize: 20 }} />
                                                                            ) : (
                                                                                <ArrowDropUpIcon sx={{ color: "green", ml: 0.5, fontSize: 20 }} />
                                                                            )}
                                                                        </span>
                                                                    ) : (
                                                                        "N/A"
                                                                    ),
                                                            },
                                                            {
                                                                label: "T+1 Day Excess Returns",
                                                                value:
                                                                    deal.t1d_excess_return !== undefined &&
                                                                        deal.t1d_excess_return !== null ? (
                                                                        <span
                                                                            style={{
                                                                                color: deal.t1d_excess_return < 0 ? "red" : "green",
                                                                                display: "inline-flex",
                                                                                alignItems: "center",
                                                                            }}
                                                                        >
                                                                            {deal.t1d_excess_return < 0 ? "-" : ""}
                                                                            {Math.abs(deal.t1d_excess_return).toFixed(2)}%
                                                                            {deal.t1d_excess_return < 0 ? (
                                                                                <ArrowDropDownIcon sx={{ color: "red", ml: 0.5, fontSize: 20 }} />
                                                                            ) : (
                                                                                <ArrowDropUpIcon sx={{ color: "green", ml: 0.5, fontSize: 20 }} />
                                                                            )}
                                                                        </span>
                                                                    ) : (
                                                                        "N/A"
                                                                    ),
                                                            },
                                                            {
                                                                label: "T+1 Month Returns",
                                                                value:
                                                                    deal.t_plus_1m_returns !== undefined &&
                                                                        deal.t_plus_1m_returns !== null ? (
                                                                        <span
                                                                            style={{
                                                                                color: deal.t_plus_1m_returns < 0 ? "red" : "green",
                                                                                display: "inline-flex",
                                                                                alignItems: "center",
                                                                            }}
                                                                        >
                                                                            {deal.t_plus_1m_returns < 0 ? "-" : ""}
                                                                            {Math.abs(deal.t_plus_1m_returns).toFixed(2)}%
                                                                            {deal.t_plus_1m_returns < 0 ? (
                                                                                <ArrowDropDownIcon sx={{ color: "red", ml: 0.5, fontSize: 20 }} />
                                                                            ) : (
                                                                                <ArrowDropUpIcon sx={{ color: "green", ml: 0.5, fontSize: 20 }} />
                                                                            )}
                                                                        </span>
                                                                    ) : (
                                                                        "N/A"
                                                                    ),
                                                            },
                                                            {
                                                                label: "T+1 Month Excess Returns",
                                                                value:
                                                                    deal.t1m_excess_returns !== undefined &&
                                                                        deal.t1m_excess_returns !== null ? (
                                                                        <span
                                                                            style={{
                                                                                color: deal.t1m_excess_returns < 0 ? "red" : "green",
                                                                                display: "inline-flex",
                                                                                alignItems: "center",
                                                                            }}
                                                                        >
                                                                            {deal.t1m_excess_returns < 0 ? "-" : ""}
                                                                            {Math.abs(deal.t1m_excess_returns).toFixed(2)}%
                                                                            {deal.t1m_excess_returns < 0 ? (
                                                                                <ArrowDropDownIcon sx={{ color: "red", ml: 0.5, fontSize: 20 }} />
                                                                            ) : (
                                                                                <ArrowDropUpIcon sx={{ color: "green", ml: 0.5, fontSize: 20 }} />
                                                                            )}
                                                                        </span>
                                                                    ) : (
                                                                        "N/A"
                                                                    ),
                                                            },
                                                            {
                                                                label: "Opportunity Value (T + 1M Excess)",
                                                                value:
                                                                    deal.opportunity_value_excess != null
                                                                        ? `$${deal.opportunity_value_excess.toLocaleString()}`
                                                                        : "N/A",
                                                            },
                                                            { label: "Left Lead Bank", value: deal.left_lead_bank || "N/A" },
                                                        ].map((row, i) => (
                                                            <TableRow
                                                                key={i}
                                                                sx={{
                                                                    backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#ffffff",
                                                                    "&:hover": { backgroundColor: "#e0f7fa" },
                                                                }}
                                                            >
                                                                <TableCell
                                                                    sx={{
                                                                        border: "1px solid #ccc",
                                                                        fontWeight: "bold",
                                                                        color: "#333",
                                                                    }}
                                                                >
                                                                    {row.label}
                                                                </TableCell>
                                                                <TableCell sx={{ border: "1px solid #ccc" }}>{row.value}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ))}
                        </>
                    ) : (
                        <Typography
                            variant="body1"
                            sx={{
                                textAlign: "center",
                                color: "red",
                                fontWeight: "bold",
                                mt: 4,
                            }}
                        >
                            No historical deals for this {ticker} ticker.
                        </Typography>
                    )}
                </Grid>



                <Grid item xs={12} md={6}>
                    {/* <Paper sx={{ p: 2, bgcolor: "#f9f9f9", overflowX: "auto" }} elevation={3}> */}
                    {Array.isArray(data.mdd_data.data) && data.mdd_data.data.length > 0 ? (
                        <>
                            <Typography variant="h6" gutterBottom sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>
                                Monashee participation in  <span style={{ color: "#ff6005", fontStyle: "italic" }}>{ticker} - {data.mdd_data.data.length} deals</span>
                            </Typography>

                            {data.mdd_data.data.length > 1 && data.mdd_data.summary && (
                                <MDDSearchSummary summary={data.mdd_data.summary} />
                            )}

                            {data.mdd_data.data.map((item, idx) => (
                                <Paper
                                    key={idx}
                                    sx={{ mb: 3, p: 2, bgcolor: "#ffffff", borderRadius: 1 }}
                                    elevation={1}
                                >
                                    <Typography variant="subtitle1" sx={{ textAlign: "center", fontWeight: "bold", mb: 1 }}>
                                        Deal Information for <span style={{ color: "#0073E6" }}>{item.ticker || "N/A"}</span> on <span style={{ color: "#0073E6" }}>{formatDate(item.pricing_date)}</span>
                                    </Typography>

                                    <Grid container spacing={2}>
                                        {/* Left Table */}
                                        <Grid item xs={12} md={6}>
                                            <TableContainer>
                                                <Table size="small" aria-label="Basic Deal Info">
                                                    <TableBody>
                                                        {[
                                                            { label: "Pricing Date", value: item.pricing_date || "N/A" },
                                                            { label: "Issuer Name", value: item.issuer_name || "N/A" },
                                                            { label: "Ticker", value: item.ticker || "N/A" },
                                                            {
                                                                label: "Sector",
                                                                value: item.gics_sector_from_bloomberg || item.gics_sector_from_bloomberg || "N/A",
                                                            },
                                                            { label: "Region", value: item.broad_region || item.broad_region || "N/A" },
                                                            { label: "Deal Type", value: item.deal_type || "N/A" },
                                                            {
                                                                label: "Deal Size",
                                                                value: item.deal_size
                                                                    ? `$${Number(item.deal_size).toLocaleString()}`
                                                                    : "N/A",
                                                            },
                                                            { label: "Issue / Offer Price", value: item.issue_offer_price || "N/A" },
                                                            { label: "Deal Captain", value: item.deal_captain || "N/A" },
                                                            {
                                                                label: "Sponsor Y/N",
                                                                value: item.sponsor === "0" ? "N" : item.sponsor || "N/A"
                                                            }

                                                        ].map((row, i) => (
                                                            <TableRow
                                                                key={i}
                                                                sx={{
                                                                    backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#ffffff",
                                                                    "&:hover": { backgroundColor: "#e0f7fa" },
                                                                }}
                                                            >
                                                                <TableCell sx={{ border: "1px solid #ccc", fontWeight: "bold", color: "#333" }}>
                                                                    {row.label}
                                                                </TableCell>
                                                                <TableCell sx={{ border: "1px solid #ccc" }}>{row.value}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>

                                        {/* Right Table */}
                                        <Grid item xs={12} md={6}>
                                            <TableContainer>
                                                <Table size="small" aria-label="MDD Data Table">
                                                    <TableBody>
                                                        {[
                                                            {
                                                                label: "Discount from Announcement Price",
                                                                value: <ArrowValue value={item.fo_discount} />,
                                                            },
                                                            {
                                                                label: "Primary %",
                                                                value:
                                                                    item.percentage_primary !== undefined && item.percentage_primary !== null
                                                                        ? `${item.percentage_primary}%`
                                                                        : "0%",
                                                            },
                                                            {
                                                                label: "Allocation as % of Deal Size",
                                                                value: <ArrowValue value={item.allocation_deal_size} />,
                                                            },
                                                            {
                                                                label: "Allocation as % of IOI",
                                                                value: <ArrowValue value={item.allocation_ioi} />,
                                                            },
                                                            {
                                                                label: "Average Hold Period",
                                                                value:
                                                                    item.average_hold_period !== undefined && item.average_hold_period !== null
                                                                        ? `${item.average_hold_period} days`
                                                                        : "N/A",
                                                            },
                                                            {
                                                                label: "Monashee Capital Committed",
                                                                value:
                                                                    item.total_committed_capital !== undefined && item.total_committed_capital !== null
                                                                        ? `$${item.total_committed_capital.toLocaleString()}`
                                                                        : "N/A",
                                                            },
                                                            {
                                                                label: "Monashee PNL Gross",
                                                                value:
                                                                    item.total_return !== undefined && item.total_return !== null ? (
                                                                        <span
                                                                            style={{
                                                                                color: item.total_return < 0 ? "red" : "green",
                                                                                display: "inline-flex",
                                                                                alignItems: "center",
                                                                            }}
                                                                        >
                                                                            {item.total_return < 0 ? "-" : ""}$
                                                                            {Math.abs(item.total_return).toLocaleString()}
                                                                            {item.total_return < 0 ? (
                                                                                <ArrowDropDownIcon sx={{ color: "red", ml: 0.5, fontSize: 20 }} />
                                                                            ) : (
                                                                                <ArrowDropUpIcon sx={{ color: "green", ml: 0.5, fontSize: 20 }} />
                                                                            )}
                                                                        </span>
                                                                    ) : (
                                                                        "N/A"
                                                                    ),
                                                            },
                                                            {
                                                                label: "Return on Invested Capital",
                                                                value:
                                                                    item.percentage_total_return !== undefined &&
                                                                        item.percentage_total_return !== null ? (
                                                                        <span
                                                                            style={{
                                                                                display: "inline-flex",
                                                                                alignItems: "center",
                                                                                color:
                                                                                    item.percentage_total_return > 0
                                                                                        ? "green"
                                                                                        : item.percentage_total_return < 0
                                                                                            ? "red"
                                                                                            : "black",
                                                                            }}
                                                                        >
                                                                            {item.percentage_total_return.toFixed(2)}%
                                                                            {item.percentage_total_return > 0 ? (
                                                                                <ArrowDropUpIcon sx={{ color: "green", ml: 0.5, fontSize: 20 }} />
                                                                            ) : item.percentage_total_return < 0 ? (
                                                                                <ArrowDropDownIcon sx={{ color: "red", ml: 0.5, fontSize: 20 }} />
                                                                            ) : (
                                                                                <ArrowDropDownIcon sx={{ color: "black", ml: 0.5, fontSize: 20 }} />
                                                                            )}
                                                                        </span>
                                                                    ) : (
                                                                        "N/A"
                                                                    ),
                                                            },
                                                            {
                                                                label: "Market T+1M Absolute Return",
                                                                value:
                                                                    item.t1m_return_from_bloomberg !== undefined &&
                                                                        item.t1m_return_from_bloomberg !== null ? (
                                                                        <span
                                                                            style={{
                                                                                display: "inline-flex",
                                                                                alignItems: "center",
                                                                                color:
                                                                                    item.t1m_return_from_bloomberg > 0
                                                                                        ? "green"
                                                                                        : item.t1m_return_from_bloomberg < 0
                                                                                            ? "red"
                                                                                            : "black",
                                                                            }}
                                                                        >
                                                                            {item.t1m_return_from_bloomberg.toFixed(2)}%
                                                                            {item.t1m_return_from_bloomberg > 0 ? (
                                                                                <ArrowDropUpIcon sx={{ color: "green", ml: 0.5, fontSize: 20 }} />
                                                                            ) : item.t1m_return_from_bloomberg < 0 ? (
                                                                                <ArrowDropDownIcon sx={{ color: "red", ml: 0.5, fontSize: 20 }} />
                                                                            ) : (
                                                                                <ArrowDropDownIcon sx={{ color: "black", ml: 0.5, fontSize: 20 }} />
                                                                            )}
                                                                        </span>
                                                                    ) : (
                                                                        "N/A"
                                                                    ),
                                                            },
                                                            { label: "Left Lead Bank", value: item.all_bank || "N/A" },
                                                        ].map((row, i) => (
                                                            <TableRow
                                                                key={i}
                                                                sx={{
                                                                    backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#ffffff",
                                                                    "&:hover": { backgroundColor: "#e0f7fa" },
                                                                }}
                                                            >
                                                                <TableCell sx={{ border: "1px solid #ccc", fontWeight: "bold", color: "#333" }}>
                                                                    {row.label}
                                                                </TableCell>
                                                                <TableCell sx={{ border: "1px solid #ccc" }}>{row.value}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ))}
                        </>
                    ) : (
                        <Typography variant="body1" sx={{ textAlign: "center", color: "red", fontWeight: "bold" }}>
                            No Monashee participation on this {ticker} ticker.
                        </Typography>
                    )}
                    {/* </Paper> */}
                </Grid>
            </Grid >
        </Box >
    );
};

export default CombinedSelectedTicker;
