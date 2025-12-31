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
  delete: "Archive Channel",
};

const actionDescriptions: Record<Action, string> = {
  create: "Create a new ticker channel by name (display name not required).",
  rename: "Rename the selected channel to a new ticker/name.",
  delete: "Archive the selected channel using its channel name.",
};

const endpoints: Record<Action, string> = {
  create: "/api/create_stock_channel/",
  rename: "/api/rename_channel/",
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
      sx={{ fontWeight: 800, color: "#e0f2fe", lineHeight: 1.1 }}
    >
      {display}
    </Typography>
    <Typography variant="caption" sx={{ color: "#cbd5f5", letterSpacing: 0.4 }}>
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

    if (isCreate && !formValues.channelName) {
      setMessage({
        type: "error",
        text: "Channel name (ticker) is required to create a channel.",
      });
      return;
    }

    if (isRename && (!formValues.displayName || !formValues.channelName)) {
      setMessage({
        type: "error",
        text: "Display name and channel name are required.",
      });
      return;
    }

    setActionLoading(true);
    setMessage(null);

    const payload =
      isCreate
        ? { stock: formValues.channelName, make_favorite: false }
        : isRename
        ? {
            channel_id: selectedChannel?.id,
            new_display_name: formValues.displayName,
            new_name: formValues.channelName,
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
        background:
          "radial-gradient(circle at 15% 20%, #12366e 0, #0a1226 45%, #050814 80%)",
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
          background:
            "linear-gradient(135deg, rgba(18,34,60,0.9), rgba(11,18,33,0.9))",
          border: "1px solid rgba(255,255,255,0.06)",
          color: "#e9edf5",
          boxShadow: "0 22px 44px rgba(0,0,0,0.45)",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Mattermost Notes UI
        </Typography>
        <Typography variant="body2" sx={{ color: "#c2d4ef", mb: 3 }}>
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
            },
            ".Mui-selected": { color: "#8de8ff !important" },
            ".MuiTabs-indicator": { backgroundColor: "#8de8ff" },
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

          <Typography variant="subtitle2" sx={{ color: "#cbd5f5" }}>
            {actionDescriptions[activeAction]}
          </Typography>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: 2,
              p: 2,
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <TextField
              label="Search ticker or channel"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              InputLabelProps={{ sx: { color: "#dbeafe" } }}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  color: "#f8fafc",
                  background: "rgba(255,255,255,0.04)",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                  "&:hover fieldset": { borderColor: "#9be8ff" },
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
                  InputLabelProps={{ sx: { color: "#dbeafe" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#f8fafc",
                      background: "rgba(255,255,255,0.04)",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                      "&:hover fieldset": { borderColor: "#9be8ff" },
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
                  InputLabelProps={{ sx: { color: "#dbeafe" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#f8fafc",
                      background: "rgba(255,255,255,0.04)",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                      "&:hover fieldset": { borderColor: "#9be8ff" },
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
                InputLabelProps={{ sx: { color: "#dbeafe" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#f8fafc",
                    background: "rgba(255,255,255,0.04)",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                    "&:hover fieldset": { borderColor: "#9be8ff" },
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
                background: "rgba(255, 159, 28, 0.08)",
                color: "#ffd08a",
                border: "1px solid rgba(255, 159, 28, 0.4)",
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
                  ? "linear-gradient(90deg, #f87171, #ef4444)"
                  : "linear-gradient(90deg, #4fd1c5, #60a5fa)",
                boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
              }}
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
