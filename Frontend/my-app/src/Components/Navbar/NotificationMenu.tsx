// src/components/Navbar/NotificationMenu.tsx
import React, { useState, useEffect } from "react";
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Badge,
  CircularProgress,
  Divider,
  ListItemText,
  Typography,
  Box,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  message?: string;
  priority?: string;
  created_at?: string;
}

interface Props {
  apiUrl: string;
  token: string | null;
}

const NotificationMenu: React.FC<Props> = ({ apiUrl, token }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!token) {
      console.warn("⚠️ No token provided, skipping fetch");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/notifications/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok)
        throw new Error(`Failed to fetch notifications: ${res.status}`);

      const data = await res.json();
      console.log("🔔 Raw API response:", data);

      setNotifications(data); // directly set array
      setUnreadCount(data.length); // update count
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch once on mount (page refresh)
  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    // reset unread count when opening
    setUnreadCount(0);
  };

  const handleClose = () => setAnchorEl(null);

  // Clear all notifications (frontend only)
  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton onClick={handleOpen}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon sx={{ color: "#002060" }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1.5, width: "320px", maxHeight: "400px" },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {loading ? (
          <MenuItem>
            <CircularProgress size={20} sx={{ mr: 2 }} /> Loading...
          </MenuItem>
        ) : notifications.length === 0 ? (
          <MenuItem>No new notifications....</MenuItem>
        ) : (
          <>
            {notifications.map((notif, idx) => (
              <MenuItem
                key={idx}
                sx={{
                  whiteSpace: "normal",
                  fontSize: "0.85rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <span>{notif.message || "New notification"}</span>

                {notif.priority && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: notif.priority === "high" ? "red" : "gray",
                      fontWeight: notif.priority === "high" ? 600 : 400,
                    }}
                  >
                    {notif.priority.toUpperCase()}
                  </span>
                )}

                {notif.created_at && (
                  <span style={{ fontSize: "0.7rem", color: "gray" }}>
                    {formatDistanceToNow(new Date(notif.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </MenuItem>
            ))}

            <Divider />
            <MenuItem
              onClick={handleClearAll}
              sx={{ justifyContent: "center", fontWeight: 600, color: "red" }}
            >
              Clear All
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationMenu;
