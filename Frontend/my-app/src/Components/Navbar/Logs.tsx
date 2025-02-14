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
  Typography,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

const Logs = () => {
  const [logs, setLogs] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("activity");
  const [search, setSearch] = useState("");

  const isAdmin = localStorage.getItem("is_admin") === "true";

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get("/api/user-logs/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
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
      { field: "username", headerName: "Username", flex: 1 },
      { field: "login_time", headerName: "Login Time", flex: 1 },
      { field: "logout_time", headerName: "Logout Time", flex: 1 },
      { field: "is_active", headerName: "Active", flex: 0.5 },
    ],
    details: [
      { field: "username", headerName: "Username", flex: 1 },
      { field: "email", headerName: "Email", flex: 1 },
      { field: "date_joined", headerName: "Joined On", flex: 1 },
    ],
    summary: [
      { field: "year", headerName: "Year", flex: 1 },
      { field: "month", headerName: "Month", flex: 1 },
      { field: "count", headerName: "Logins", flex: 1 },
    ],
  };

  const getRows = () => {
    if (!logs) return [];
    if (view === "activity") return handleSearch(logs.user_activity);
    if (view === "details") return handleSearch(logs.user_details);
    if (view === "summary") {
        return handleSearch(
            Object.entries(logs.monthly_summary).flatMap(([year, monthsObj]) =>
              Object.entries(monthsObj as Record<string, number>).map(([month, count]) => ({
                id: `${year}-${month}`,
                year,
                month,
                count,
              }))
            )
          );
          
    }
    return [];
  };

  return (
    <Box textAlign="center" mt={2}>
      {isAdmin && (
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          User Logs
        </Button>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          User Logs
          <IconButton onClick={() => setOpen(false)} sx={{ position: "absolute", right: 10, top: 10 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box display="flex" justifyContent="center" gap={2} mb={2}>
            <Button
              variant={view === "activity" ? "contained" : "outlined"}
              onClick={() => setView("activity")}
            >
              User Activity
            </Button>
            <Button
              variant={view === "details" ? "contained" : "outlined"}
              onClick={() => setView("details")}
            >
              User Details
            </Button>
            <Button
              variant={view === "summary" ? "contained" : "outlined"}
              onClick={() => setView("summary")}
            >
              Monthly Summary
            </Button>
          </Box>

          <TextField
            fullWidth
            label="Search..."
            variant="outlined"
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2 }}
          />

          {loading ? (
            <CircularProgress />
          ) : (
            <Box sx={{ height: 400 }}>
              <DataGrid rows={getRows()} columns={columns[view]}/>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Logs;
