import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
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
  delete: "Delete Channel",
};

const actionDescriptions: Record<Action, string> = {
  create: "Create a new Mattermost discussion channel for a ticker.",
  rename: "Rename the selected channel to a new ticker/name.",
  delete: "Delete the selected channel from Mattermost.",
};

const endpoints: Record<Action, string> = {
  create: "/api/create_channel/",
  rename: "/api/rename_channel/",
  delete: "/api/delete_channel/",
};

const successMessages: Record<Action, string> = {
  create: "Channel created successfully.",
  rename: "Channel renamed successfully.",
  delete: "Channel deleted successfully.",
};

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

  const activeAction = actions[currentTab];

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
      setFormValues({
        displayName: selectedChannel.display_name,
        channelName: selectedChannel.name,
      });
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
      return;
    }

    if (
      (activeAction === "rename" || activeAction === "delete") &&
      !selectedChannel
    ) {
      setMessage({ type: "error", text: "Please select a channel first." });
      return;
    }

    if (
      (activeAction === "create" || activeAction === "rename") &&
      (!formValues.displayName || !formValues.channelName)
    ) {
      setMessage({
        type: "error",
        text: "Display name and channel name are required.",
      });
      return;
    }

    setActionLoading(true);
    setMessage(null);

    const payload =
      activeAction === "create"
        ? { display_name: formValues.displayName, name: formValues.channelName }
        : activeAction === "rename"
        ? {
            channel_id: selectedChannel?.id,
            new_display_name: formValues.displayName,
            new_name: formValues.channelName,
          }
        : { channel_id: selectedChannel?.id };

    const method = activeAction === "delete" ? "DELETE" : "POST";

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
      setFormValues({ displayName: "", channelName: "" });
      setSelectedChannel(null);
      fetchChannels();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Unexpected error occurred.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #0d1b2a, #0b132b)",
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
          background: "linear-gradient(135deg, #101727, #0d111c)",
          color: "#f4f6fb",
          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Mattermost Notes UI
        </Typography>
        <Typography variant="body2" sx={{ color: "#a0aec0", mb: 3 }}>
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
            ".MuiTab-root": { textTransform: "none", fontWeight: 600 },
            ".Mui-selected": { color: "#4dd0e1 !important" },
          }}
        >
          <Tab label="Create Channel" />
          <Tab label="Rename Channel" />
          <Tab label="Delete Channel" />
        </Tabs>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 3 }} />

        <Stack spacing={2}>
          {message && (
            <Alert
              severity={message.type}
              onClose={() => setMessage(null)}
              sx={{
                backgroundColor: "#0f172a",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#e2e8f0",
              }}
            >
              {message.text}
            </Alert>
          )}

          <Typography variant="subtitle2" sx={{ color: "#a0aec0" }}>
            {actionDescriptions[activeAction]}
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Search ticker or channel"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              InputLabelProps={{ sx: { color: "#cbd5e1" } }}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  color: "#f8fafc",
                  background: "#111827",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                  "&:hover fieldset": { borderColor: "#4dd0e1" },
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
              noOptionsText={loadingChannels ? "Loading..." : "No channels found"}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select channel / ticker"
                  InputLabelProps={{ sx: { color: "#cbd5e1" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#f8fafc",
                      background: "#111827",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                      "&:hover fieldset": { borderColor: "#4dd0e1" },
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
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 700, color: "#e2e8f0", lineHeight: 1.1 }}
                    >
                      {option.display_name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#a0aec0", letterSpacing: 0.3 }}
                    >
                      {option.name}
                    </Typography>
                  </Box>
                </li>
              )}
            />
          </Stack>

          {(activeAction === "create" || activeAction === "rename") && (
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
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
                InputLabelProps={{ sx: { color: "#cbd5e1" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#f8fafc",
                    background: "#111827",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                    "&:hover fieldset": { borderColor: "#4dd0e1" },
                  },
                }}
              />
              <TextField
                label="Channel name (slug)"
                value={formValues.channelName}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    channelName: e.target.value,
                  }))
                }
                fullWidth
                InputLabelProps={{ sx: { color: "#cbd5e1" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#f8fafc",
                    background: "#111827",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                    "&:hover fieldset": { borderColor: "#4dd0e1" },
                  },
                }}
                helperText="Use lowercase and hyphens, e.g., amzn-us-thoughts"
              />
            </Stack>
          )}

          {activeAction === "delete" && selectedChannel && (
            <Alert
              severity="warning"
              sx={{
                background: "#33272a",
                color: "#fef9c3",
                border: "1px solid rgba(252, 211, 77, 0.4)",
              }}
            >
              Deleting <strong>{selectedChannel.display_name}</strong> (
              {selectedChannel.name}) cannot be undone.
            </Alert>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="contained"
              color={activeAction === "delete" ? "error" : "primary"}
              onClick={handleAction}
              disabled={actionLoading}
              sx={{ minWidth: 180, fontWeight: 700, textTransform: "none" }}
            >
              {actionLoading ? "Working..." : actionLabels[activeAction]}
            </Button>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

export default NotesUI;
