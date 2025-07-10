import React, { useEffect, useState } from "react";
import {
    Box,
    CircularProgress,
    Typography,
    Paper,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface MostAgedStockData {
    ticker: string;
    first_trade_date: string;
    cumulative_pnl: number;
    days_held: number;
}

interface MostAgedStocksTableProps {
    fund: string;
}

const MostAgedStocksTable: React.FC<MostAgedStocksTableProps> = ({ fund }) => {
    const [data, setData] = useState<MostAgedStockData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    useEffect(() => {
        const fetchData = async () => {
            if (!fund) return;

            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`${apiUrl}/api/most_aged_stocks/`, {
                    method: "POST",
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ fund }),
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }

                const result: MostAgedStockData[] = await res.json();
                setData(result);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fund, apiUrl, token]);

    const columns: GridColDef[] = [
        { field: "ticker", headerName: "Ticker", flex: 1 },
        {
            field: "first_trade_date",
            headerName: "First Trade Date",
            flex: 1,
        },
        {
            field: "cumulative_pnl",
            headerName: "Cumulative PnL",
            flex: 1,
        },
        {
            field: "days_held",
            headerName: "Days Held",
            flex: 1,
        },
    ];

    return (
        <Box p={3}>
            <Typography variant="h6" align="center" gutterBottom sx={{ color: "#002060", fontWeight: 600 }}>
                Most Aged Stocks for {fund}
            </Typography>

            <Paper elevation={3} sx={{ p: 2 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <DataGrid
                        rows={data.map((row, index) => ({ id: index, ...row }))}
                        columns={columns}
                        autoHeight
                        pageSizeOptions={[25]}
                        pagination
                        initialState={{
                            pagination: { paginationModel: { pageSize: 25, page: 0 } },
                        }}
                        disableRowSelectionOnClick
                        disableColumnMenu
                        sx={{
                            fontFamily: "Arial, sans-serif",
                            borderRadius: 2,
                            overflow: "hidden",
                            boxShadow: 3,
                            backgroundColor: "#ffffff",
                            "& .MuiDataGrid-root": {
                                border: "none",
                                fontSize: "0.8rem",
                            },
                            "& .MuiDataGrid-columnHeaders": {
                                backgroundColor: "#77B0FC",
                                color: "#000000",
                                fontWeight: "bold",
                                fontSize: "0.85rem",
                            },
                            "& .MuiDataGrid-columnHeader": {
                                backgroundColor: "#77B0FC",
                                color: "#000000",
                            },
                            "& .MuiDataGrid-row:nth-of-type(even)": {
                                backgroundColor: "#f5f8fc",
                            },
                            "& .MuiDataGrid-row:nth-of-type(odd)": {
                                backgroundColor: "#ffffff",
                            },
                            "& .MuiDataGrid-cell": {
                                borderBottom: "1px solid #e0e0e0",
                            },
                            "& .MuiDataGrid-row:hover": {
                                backgroundColor: "#dee7f7",
                                transition: "background-color 0.3s ease",
                            },
                        }}
                    />
                )}
            </Paper>
        </Box>
    );
};

export default MostAgedStocksTable;
