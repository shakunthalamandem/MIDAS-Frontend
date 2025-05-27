import React, { useState, useEffect } from "react";
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  Typography,
  InputAdornment,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Logs = () => {
  const [logs, setLogs] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("activity");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${apiUrl}/api/user_activity/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
      // navigate("/error");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchLogs();
  }, [open]);

  const handleSearch = (data: any[]) => {
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  const columns: { [key: string]: GridColDef[] } = {
    activity: [
      { field: "id", headerName: "ID", flex: 0.3,width: 70, headerClassName: "highlight-id" },
      { field: "username", headerName: "Username",width: 10, flex: 1,headerClassName: "highlight-id" },
      { field: "login_time", headerName: "Login Time", flex: 1,headerClassName: "highlight-id" },
      { field: "logout_time", headerName: "Logout Time", flex: 1 ,headerClassName: "highlight-id"},
      { field: "ip_address", headerName: "IP Address", flex: 0.5 ,headerClassName: "highlight-id"},
      { field: "is_active", headerName: "Active", flex: 0.5 ,headerClassName: "highlight-id"},
    ],
    details: [
      { field: "id", headerName: "ID", flex: 0.3, headerClassName: "highlight-id" },
      { field: "username", headerName: "Username", flex: 1,headerClassName: "highlight-id" },
      { field: "email", headerName: "Email", flex: 1 ,headerClassName: "highlight-id"},
      { field: "date_joined", headerName: "Joined On", flex: 1 ,headerClassName: "highlight-id"},
    ],
    summary: [
      { field: "id", headerName: "ID", flex: 0.3, headerClassName: "highlight-id" },
      { field: "year", headerName: "Year", flex: 1,headerClassName: "highlight-id" },
      { field: "month", headerName: "Month", flex: 1 ,headerClassName: "highlight-id"},
      { field: "count", headerName: "Login Count", flex: 1,headerClassName: "highlight-id" },
    ],
  };

  const getRows = () => {
    if (!logs) return [];

    if (view === "activity") {
      return handleSearch(logs.user_activity).map((item, index) => ({
        id: index,
        ...item,
      }));
    }

    if (view === "details") {
      return handleSearch(logs.user_details).map((item, index) => ({
        id: index,
        ...item,
      }));
    }

    if (view === "summary") {
      const flatData = Object.entries(logs.monthly_summary).flatMap(
        ([year, monthsObj]) =>
          Object.entries(monthsObj as Record<string, number>).map(
            ([month, count]) => ({
              year,
              month,
              count,
            })
          )
      );

      return handleSearch(flatData).map((item, index) => ({
        id: index, // <- Here, id starts from 0
        ...item,
      }));
    }

    return [];
  };

  return (
    <Box textAlign="center" mt={2} height={60}>
       <Button  color="secondary" sx={{
                color: '#FFFFFF',
                marginTop:'8px',
                height:'30px',

                backgroundColor: '#21004b',
                fontWeight: 'bold',
                fontFamily: 'Roboto, sans-serif',
                '&:hover': { backgroundColor: '#bb4401' },
              }} onClick={() => setOpen(true)}>
        Logs
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#f1f5f9",
            borderRadius: "18px",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#1e293b",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 2,
            px: 3,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            User Logs
          </Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, marginTop: 4 }}>
          <Box display="flex" alignItems="center" justifyContent="center" mb={3} position="relative">
            <Tabs
              value={view}
              onChange={(e, newValue) => setView(newValue)}
              textColor="inherit"
              sx={{
                backgroundColor: "#cbd5e1",
                borderRadius: "12px",
                px: 2,
                ".MuiTab-root": {
                  minWidth: "140px",
                  fontWeight: "600",
                  fontSize: "15px",
                  color: "#334155",
                  mx: 0.5,
                  "&.Mui-selected": {
                    backgroundColor: "#dbeafe",
                    color: "#2563eb",
                  },
                  "&:hover": {
                    backgroundColor: "#e2e8f0",
                  },
                },
              }}
            >
              <Tab label="Activity" value="activity" />
              <Tab label="User Details" value="details" />
              <Tab label="Summary" value="summary" />
            </Tabs>

            <Box position="absolute" right={0}>
              <TextField
                placeholder="Search..."
                variant="outlined"
                size="small"
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  width: "280px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
            </Box>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ height: 500 }}>
              <DataGrid
                rows={getRows()}
                columns={columns[view]}
                rowHeight={50}
                disableRowSelectionOnClick
                sx={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "12px",
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#cbd5e1",
                    fontWeight: "bold",
                    fontSize: "15px",
                    color: "#1f2937",
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "#e5e7eb",
                  },
                  fontSize: "15px",
                  "& .highlight-id": {
                    backgroundColor: "#ccd1d1",
                    color: "black",
                    fontWeight: "bold",
                    fontSize: "15px",
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            sx={{
              backgroundColor: "#ef4444",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "10px",
              px: 3,
              py: 1,
              "&:hover": {
                backgroundColor: "#dc2626",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Logs;
