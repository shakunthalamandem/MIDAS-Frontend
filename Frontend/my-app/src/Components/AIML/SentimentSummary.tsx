import React, { useEffect, useState } from "react";
import {
    Box,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    TextField,
    Button,
    Typography,
    Chip,
    ChipProps,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

interface SentimentData {
    ticker: string;
    issuer_name: string;
    pricing_date: string | null;
    unique_deal_id: string;
    one_week_sentiment: string | null;
    one_month_sentiment: string | null;
    sentiment_summary?: {
        one_week?: string;
        one_month?: string;
    };
}

const SentimentSummary: React.FC = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();

    const [data, setData] = useState<SentimentData[]>([]);
    const [filteredData, setFilteredData] = useState<SentimentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedSummary, setSelectedSummary] = useState<SentimentData | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const res = await fetch(`${apiUrl}/api/sentiment_sumamry_data/`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                });

                const result = await res.json();
                const arr = Array.isArray(result) ? result : result.data || [];

                const mapped = arr.map((item: any) => ({
                    ...item,
                    sentiment_summary:
                        typeof item.sentiment_summary === "string"
                            ? JSON.parse(item.sentiment_summary)
                            : item.sentiment_summary,
                }));

                setData(mapped);
                setFilteredData(mapped);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl]);

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        setFilteredData(
            data.filter(
                (d) =>
                    d.ticker.toLowerCase().includes(term) ||
                    d.issuer_name.toLowerCase().includes(term) ||
                    d.unique_deal_id.toLowerCase().includes(term)
            )
        );
    }, [searchTerm, data]);

    const getSentiment = (
        sentiment: string | null
    ): { color: ChipProps["color"]; label: string } => {
        switch (sentiment?.toLowerCase()) {
            case "bullish":
                return { color: "success", label: "Bullish" };
            case "bearish":
                return { color: "error", label: "Bearish" };
            case "neutral":
                return { color: "warning", label: "Neutral" };
            default:
                return { color: "default", label: sentiment || "N/A" };
        }
    };

    const preview = (text?: string) =>
        text ? text.split(" ").slice(0, 15).join(" ") + "..." : "N/A";

    const handleOpenDialog = (row: SentimentData) => {
        setSelectedSummary(row);
        setOpenDialog(true);
    };

    const handleRowClick = (row: SentimentData) => {
        navigate(`/ai_sentiment_view?ticker=${row.ticker}`);
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl">
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                {/* Left: Title */}
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Sentiment Summary
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        AI-driven IPO sentiment insights
                    </Typography>
                </Box>

                {/* Right: Search */}
                <TextField
                    placeholder="Search ticker, issuer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ width: 280 }}
                    InputProps={{
                        startAdornment: <SearchOutlinedIcon sx={{ mr: 1 }} />,
                    }}
                />
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {/* Table */}
            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: 3,
                    boxShadow: 3,
                    maxHeight: 550,
                    mb: 5,
                }}
            >
                <Table stickyHeader >
                    <TableHead>
                        <TableRow>
                            {["Ticker", "Issuer", "Date", "1-Week", "1-Month", "Summary", "Action"].map(
                                (h) => (
                                    <TableCell
                                        key={h}
                                        sx={{
                                            fontWeight: 600,
                                            backgroundColor: "#c7e4f1",
                                        }}
                                    >
                                        {h}
                                    </TableCell>
                                )
                            )}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredData.map((row, i) => {
                            const week = getSentiment(row.one_week_sentiment);
                            const month = getSentiment(row.one_month_sentiment);

                            return (
                                <TableRow
                                    key={i}
                                    hover
                                    sx={{
                                        cursor: "pointer",
                                        transition: "0.2s",
                                        "&:hover": {
                                            backgroundColor: "#c7e4f1",
                                        },
                                    }}
                                    onClick={() => handleRowClick(row)}
                                >
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        {row.ticker}
                                    </TableCell>

                                    <TableCell>{row.issuer_name}</TableCell>

                                    <TableCell>
                                        {row.pricing_date || "TBA"}
                                    </TableCell>

                                    <TableCell>
                                        <Chip label={week.label} color={week.color} size="small" />
                                    </TableCell>

                                    <TableCell>
                                        <Chip label={month.label} color={month.color} size="small" />
                                    </TableCell>

                                    {/* Summary */}
                                    <TableCell sx={{ maxWidth: 300 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                fontSize: "0.8rem",
                                                color: "text.secondary",
                                            }}
                                        >
                                            {preview(row.sentiment_summary?.one_week)}
                                        </Typography>

                                        <Button
                                            size="small"
                                            sx={{ mt: 0.5, textTransform: "none" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenDialog(row);
                                            }}
                                        >
                                            Read more
                                        </Button>
                                    </TableCell>

                                    {/* Action */}
                                    <TableCell>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRowClick(row);
                                            }}
                                            sx={{ textTransform: "none" }}
                                        >
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
                <DialogTitle>
                    {selectedSummary?.ticker} Sentiment Details
                </DialogTitle>

                <DialogContent>
                    <Typography variant="subtitle2">1 Week</Typography>
                    <Typography sx={{ mb: 2 }}>
                        {selectedSummary?.sentiment_summary?.one_week}
                    </Typography>

                    <Typography variant="subtitle2">1 Month</Typography>
                    <Typography>
                        {selectedSummary?.sentiment_summary?.one_month}
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default SentimentSummary;