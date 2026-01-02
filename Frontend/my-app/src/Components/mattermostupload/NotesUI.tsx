import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

type Channel = { id: string; name: string; display_name: string };
type Action = "create" | "rename" | "delete";

const actions: Action[] = ["create", "rename", "delete"];

const actionLabels: Record<Action, string> = {
  create: "Create Channel",
  rename: "Rename Channel",
  delete: "Archive Channel",
};

const actionDescriptions: Record<Action, string> = {
  create: "Create a new ticker channel by name (display name not required).",
  rename: "Update the selected channel name and/or display name.",
  delete: "Archive the selected channel using its channel name.",
};

const endpoints: Record<Action, string> = {
  create: "/api/create_stock_channel/",
  rename: "/api/update_stock_channel/",
  delete: "/api/archive_stock_channel/",
};

const successMessages: Record<Action, string> = {
  create: "Channel created successfully.",
  rename: "Channel renamed successfully.",
  delete: "Channel archived successfully.",
};

const ChannelOption: React.FC<{ display: string; name: string }> = ({
  display,
  name,
}) => (
  <Box sx={{ display: "flex", flexDirection: "column" }}>
    <Typography
      variant="body1"
      sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}
    >
      {display}
    </Typography>
    <Typography variant="caption" sx={{ color: "#475569", letterSpacing: 0.4 }}>
      {name}
    </Typography>
  </Box>
);

const NotesUI: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [formValues, setFormValues] = useState({
    displayName: "",
    channelName: "",
  });
  const [loadingChannels, setLoadingChannels] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const activeAction = actions[currentTab];
  const isCreate = activeAction === "create";
  const isRename = activeAction === "rename";
  const isDelete = activeAction === "delete";

  useEffect(() => {
    setSelectedChannel(null);
    setFormValues({ displayName: "", channelName: "" });
    setMessage(null);
  }, [currentTab]);

  const fetchChannels = async () => {
    if (!apiUrl) {
      setMessage({ type: "error", text: "API URL not configured." });
      return;
    }

    setLoadingChannels(true);
    setMessage(null);
    try {
      const res = await fetch(`${apiUrl}/api/get_team_channels/`, {
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error("Unable to load channels.");
      }

      const data = await res.json();
      setChannels(Array.isArray(data.channels) ? data.channels : []);
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Unexpected error while fetching channels.",
      });
    } finally {
      setLoadingChannels(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [apiUrl]);

  useEffect(() => {
    if (selectedChannel) {
      setFormValues((prev) => ({
        ...prev,
        displayName: selectedChannel.display_name,
        channelName: selectedChannel.name,
      }));
    }
  }, [selectedChannel]);

  const filteredChannels = useMemo(() => {
    if (!searchTerm.trim()) return channels;

    const lower = searchTerm.toLowerCase();
    return channels.filter(
      (channel) =>
        channel.display_name.toLowerCase().includes(lower) ||
        channel.name.toLowerCase().includes(lower)
    );
  }, [channels, searchTerm]);

  const handleAction = async () => {
    if (!apiUrl) {
      setMessage({ type: "error", text: "API URL not configured." });
      setSnackbarOpen(false);
      return;
    }

    if ((isRename || isDelete) && !selectedChannel) {
      setMessage({ type: "error", text: "Please select a channel first." });
      setSnackbarOpen(false);
      return;
    }

    if (isCreate && !formValues.channelName) {
      setMessage({
        type: "error",
        text: "Channel name (ticker) is required to create a channel.",
      });
      setSnackbarOpen(false);
      return;
    }

    if (isRename && !formValues.channelName) {
      setMessage({
        type: "error",
        text: "Channel name is required to rename.",
      });
      setSnackbarOpen(false);
      return;
    }

    setActionLoading(true);
    setMessage(null);
    setSnackbarOpen(false);

    const payload =
      isCreate
        ? { stock: formValues.channelName, make_favorite: false }
        : isRename
        ? {
            actual_channel_name: selectedChannel?.name,
            new_channel_name: formValues.channelName || null,
            new_display_name: formValues.displayName || null,
          }
        : { channel_name: selectedChannel?.name };

    const method = "POST";

    try {
      const res = await fetch(`${apiUrl}${endpoints[activeAction]}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.message || `Unable to ${activeAction} channel at the moment.`
        );
      }

      setMessage({ type: "success", text: successMessages[activeAction] });
      setSnackbarOpen(true);
      setFormValues({ displayName: "", channelName: "" });
      setSelectedChannel(null);
      fetchChannels();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Unexpected error occurred.",
      });
      setSnackbarOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box
      sx={{
        background: "#f6f7fb",
        minHeight: "100vh",
        p: 3,
      }}
    >
      <Card
        elevation={6}
        sx={{
          maxWidth: 1100,
          mx: "auto",
          p: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #ffffff, #eef3ff)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          color: "#0f172a",
          boxShadow: "0 16px 44px rgba(59,130,246,0.22)",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, mb: 1, color: "#1d4ed8" }}
        >
          Mattermost Notes UI
        </Typography>
        <Typography variant="body2" sx={{ color: "#475569", mb: 3 }}>
          Manage ticker-based discussion channels with quick search and
          selection.
        </Typography>

        <Tabs
          value={currentTab}
          onChange={(_, value) => setCurrentTab(value)}
          textColor="inherit"
          indicatorColor="primary"
          sx={{
            mb: 3,
            ".MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              letterSpacing: 0.2,
              color: "#334155",
            },
            ".Mui-selected": { color: "#0ea5e9 !important" },
            ".MuiTabs-indicator": { backgroundColor: "#0ea5e9" },
          }}
        >
          <Tab label="Create Channel" />
          <Tab label="Rename Channel" />
          <Tab label="Delete Channel" />
        </Tabs>

        <Divider sx={{ borderColor: "rgba(100,116,139,0.15)", mb: 3 }} />

        <Stack spacing={2}>
          {message?.type === "error" && (
            <Alert
              severity={message.type}
              onClose={() => setMessage(null)}
              sx={{
                backgroundColor: "#fff5f5",
                border: "1px solid rgba(248,113,113,0.35)",
                color: "#991b1b",
              }}
            >
              {message.text}
            </Alert>
          )}

          <Typography variant="subtitle2" sx={{ color: "#475569" }}>
            {actionDescriptions[activeAction]}
          </Typography>

          {!isCreate && (
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{
                background: "#f8fafc",
                borderRadius: 2,
                p: 2,
                border: "1px solid rgba(59,130,246,0.18)",
              }}
            >
              <TextField
                label="Search ticker or channel"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                InputLabelProps={{ sx: { color: "#334155" } }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    color: "#0f172a",
                    background: "#ffffff",
                    "& fieldset": { borderColor: "rgba(148,163,184,0.5)" },
                    "&:hover fieldset": { borderColor: "#0ea5e9" },
                  },
                }}
              />

              <Autocomplete
                fullWidth
                loading={loadingChannels}
                options={filteredChannels}
                value={selectedChannel}
                onChange={(_, value) => setSelectedChannel(value)}
                getOptionLabel={(option) => option.display_name || option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={
                  loadingChannels ? "Loading..." : "No channels found"
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select channel / ticker"
                    InputLabelProps={{ sx: { color: "#334155" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "#0f172a",
                        background: "#ffffff",
                        "& fieldset": { borderColor: "rgba(148,163,184,0.5)" },
                        "&:hover fieldset": { borderColor: "#0ea5e9" },
                      },
                    }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingChannels ? (
                            <CircularProgress color="inherit" size={18} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li
                    {...props}
                    key={option.id}
                    style={{ paddingTop: 10, paddingBottom: 10 }}
                  >
                    <ChannelOption
                      display={option.display_name}
                      name={option.name}
                    />
                  </li>
                )}
              />
            </Stack>
          )}

          {(isCreate || isRename) && (
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              {isRename && (
                <TextField
                  label="Display name"
                  value={formValues.displayName}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                    }))
                  }
                  fullWidth
                  InputLabelProps={{ sx: { color: "#334155" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#0f172a",
                      background: "#ffffff",
                      "& fieldset": { borderColor: "rgba(148,163,184,0.5)" },
                      "&:hover fieldset": { borderColor: "#0ea5e9" },
                    },
                  }}
                />
              )}
              <TextField
                label={
                  isCreate ? "Channel / ticker name" : "New channel name (slug)"
                }
                value={formValues.channelName}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    channelName: e.target.value,
                  }))
                }
                fullWidth
                InputLabelProps={{ sx: { color: "#334155" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#0f172a",
                    background: "#ffffff",
                    "& fieldset": { borderColor: "rgba(148,163,184,0.5)" },
                    "&:hover fieldset": { borderColor: "#0ea5e9" },
                  },
                }}
                helperText="Use lowercase and hyphens, e.g., amzn-us-thoughts"
              />
            </Stack>
          )}

              {isDelete && selectedChannel && (
                <Alert
                  severity="warning"
                  sx={{
                    background: "#fff7ed",
                    color: "#9a3412",
                    border: "1px solid rgba(234, 88, 12, 0.35)",
                  }}
                >
                  Deleting <strong>{selectedChannel.display_name}</strong> (
                  {selectedChannel.name}) cannot be undone.
                </Alert>
              )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="contained"
              color={isDelete ? "error" : "primary"}
              onClick={handleAction}
              disabled={actionLoading}
              sx={{
                minWidth: 180,
                fontWeight: 800,
                textTransform: "none",
                background: isDelete
                  ? "linear-gradient(90deg, #f97316, #dc2626)"
                  : "linear-gradient(120deg, #22d3ee, #2563eb)",
                boxShadow: "0 12px 28px rgba(37,99,235,0.2)",
              }}
            >
              {actionLoading ? "Working..." : actionLabels[activeAction]}
            </Button>
          </Box>
        </Stack>

        <Snackbar
          open={snackbarOpen && message?.type === "success"}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            {message?.text}
          </Alert>
        </Snackbar>
      </Card>
    </Box>
  );
};

export default NotesUI;
