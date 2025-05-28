import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Card,
    CardContent,
    Typography,
    Grid,
    CircularProgress,
    Box,
} from "@mui/material";

interface PredictedForm {
    ticker_symbol: string;
    pricing_date: string;
    deal_type: string;
    region: string;
    target_variable: string;
    sponsor: string;
    deal_size_million: number;
    selected_bank: string;
    percentage_primary: number;
    sector: string;
    discount_announcement_price: number;
    allocation_percentage_of_deal: number;
    allocation_percentage_of_ioi: number;
    gdp_growth: string;
    inflation_rate: string;
    treasury_rates: string;
    main_model_predicted: string;
    positive_model_predicted: boolean;
    negative_model_predicted: boolean;
    main_model_actual: string | null;
    positive_model_actual: string | null;
    negative_model_actual: string | null;
}

const AiDashboard: React.FC = () => {
    const [data, setData] = useState<PredictedForm[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const today = new Date().toISOString().slice(0, 10);
            try {
                const response = await fetch(`${apiUrl}/api/predicted_forms/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                });
                const responseData = await response.json();
                setData(Array.isArray(responseData.data) ? responseData.data : []);
            } catch {
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCardClick = (item: PredictedForm) => {
        const params = new URLSearchParams(item as any).toString();
        window.open(`/equity/ml_equity?${params}`, "_blank");
    };

    if (loading)
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    if (!data.length)
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography>No data available.</Typography>
            </Box>
        );

    return (
        <Grid container spacing={2}>
            {data.map((item, idx) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                    <Card
                        onClick={() => handleCardClick(item)}
                        sx={{
                            cursor: "pointer",
                            transition: "box-shadow 0.2s",
                            "&:hover": { boxShadow: 6 },
                        }}
                        variant="outlined"
                    >
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {item.ticker_symbol}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Pricing Date:</strong> {item.pricing_date}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Deal Size:</strong> ${item.deal_size_million}M
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Region:</strong> {item.region}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Sector:</strong> {item.sector}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Prediction:</strong> {item.main_model_predicted}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default AiDashboard;