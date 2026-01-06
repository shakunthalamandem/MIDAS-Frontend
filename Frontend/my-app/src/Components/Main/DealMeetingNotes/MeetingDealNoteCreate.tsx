import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import SearchIcon from "@mui/icons-material/Search";

interface MeetingNotePayload {
  deal_name?: string;
  ticker?: string;
  meeting_date?: string | null;
  notes?: string | null;
  id?: string | number;
  [key: string]: unknown;
}

const MeetingDealNoteCreate: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<MeetingNotePayload[]>([]);
  const [formData, setFormData] = useState({
    dealName: "",
    ticker: "",
    meetingDate: "",
    notes: "",
  });
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const handleSearch = async () => {
    if (!apiUrl) {
      setStatus({ type: "error", message: "API URL is missing. Please set REACT_APP_API_URL." });
      return;
    }

    setSearching(true);
    setStatus(null);

    try {
      const response = await fetch(
        `${apiUrl}/api/deal_meeting_notes_base_payload/?search=${encodeURIComponent(searchTerm)}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error("Search request failed");
      }

      const data = await response.json();
      const parsedResults: MeetingNotePayload[] = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.results)
        ? (data as any).results
        : Array.isArray((data as any)?.data)
        ? (data as any).data
        : [];

      setSearchResults(parsedResults);
      setStatus({ type: "info", message: `Found ${parsedResults.length} item${parsedResults.length === 1 ? "" : "s"}.` });
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: "Unable to search meeting notes." });
    } finally {
      setSearching(false);
    }
  };

  const handleCreate = async () => {
    if (!apiUrl) {
      setStatus({ type: "error", message: "API URL is missing. Please set REACT_APP_API_URL." });
      return;
    }

    if (!formData.dealName.trim()) {
      setStatus({ type: "error", message: "Deal name is required to create a meeting note." });
      return;
    }

    setCreating(true);
    setStatus(null);

    try {
      const payload = {
        deal_name: formData.dealName,
        ticker: formData.ticker,
        meeting_date: formData.meetingDate || null,
        notes: formData.notes,
      };

      const response = await fetch(`${apiUrl}/api/deal_meeting_notes_base_payload/`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Create request failed");
      }

      setStatus({ type: "success", message: "Meeting note created successfully." });
      setFormData({ dealName: "", ticker: "", meetingDate: "", notes: "" });

      setSearchResults((prev) => [payload, ...prev]);
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: "Unable to create meeting note. Please try again." });
    } finally {
      setCreating(false);
    }
  };

  const renderSecondaryText = (item: MeetingNotePayload) => {
    const parts: string[] = [];
    if (item.ticker) parts.push(`Ticker: ${item.ticker}`);
    if (item.meeting_date) parts.push(`Meeting: ${item.meeting_date}`);
    if (item.notes) parts.push(String(item.notes).slice(0, 120));
    return parts.join(" | ") || "No additional details provided.";
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 1, md: 0 }, background: "transparent" }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <Typography fontWeight={700} color="#002060">
              Search Meeting Notes
            </Typography>
            <TextField
              label="Search by keyword or ticker"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <Box display="flex" gap={1} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={searching}
              >
                {searching ? <CircularProgress size={20} /> : "Search"}
              </Button>
            </Box>

            <Paper
              variant="outlined"
              sx={{
                p: 1,
                maxHeight: 360,
                overflowY: "auto",
                borderRadius: 2,
                borderColor: "rgba(0,32,96,0.2)",
              }}
            >
              {searchResults.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No search results yet.
                </Typography>
              ) : (
                <List dense>
                  {searchResults.map((item, index) => (
                    <ListItem key={(item.id as string) || `${index}-${item.deal_name || item.ticker || "item"}`} divider>
                      <ListItemText
                        primary={item.deal_name || item.ticker || "Deal"}
                        secondary={renderSecondaryText(item)}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            <Typography fontWeight={700} color="#002060">
              Create New Meeting Note
            </Typography>
            <TextField
              label="Deal name"
              required
              value={formData.dealName}
              onChange={(e) => setFormData((prev) => ({ ...prev, dealName: e.target.value }))}
            />
            <TextField
              label="Ticker"
              value={formData.ticker}
              onChange={(e) => setFormData((prev) => ({ ...prev, ticker: e.target.value }))}
            />
            <TextField
              label="Meeting date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.meetingDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, meetingDate: e.target.value }))}
            />
            <TextField
              label="Notes"
              multiline
              minRows={4}
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            />

            <Box display="flex" gap={1} alignItems="center">
              <Button
                variant="contained"
                startIcon={<NoteAddIcon />}
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? <CircularProgress size={20} color="inherit" /> : "Create Meeting Note"}
              </Button>
              <Typography variant="body2" color="text.secondary">
                Deal name is required; other fields are optional.
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {status && (
        <Box mt={3}>
          <Alert severity={status.type}>{status.message}</Alert>
        </Box>
      )}
    </Paper>
  );
};

export default MeetingDealNoteCreate;
