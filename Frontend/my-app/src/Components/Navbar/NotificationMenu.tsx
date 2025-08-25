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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  message?: string;
  priority?: string;
  created_at?: string;
}

const NotificationMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [viewAllOpen, setViewAllOpen] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

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
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok)
        throw new Error(`Failed to fetch notifications: ${res.status}`);

      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.length);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setUnreadCount(0); // reset count when menu is opened
  };

  const handleClose = () => setAnchorEl(null);

  // Clear all notifications
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

      {/* Dropdown Menu (shows only 3 latest notifications) */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1.5, width: "320px", maxHeight: "500px" },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {/* Header */}
        <MenuItem
          disableRipple
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 600,
            position: "sticky",
            top: 0,
            backgroundColor: "white",
            zIndex: 1,
          }}
        >
          Notifications
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </MenuItem>

        <Divider />

        {loading ? (
          <MenuItem>
            <CircularProgress size={20} sx={{ mr: 2 }} /> Loading...
          </MenuItem>
        ) : notifications.length === 0 ? (
          <MenuItem>No new notifications....</MenuItem>
        ) : (
          <>
            {/* Show only first 3 notifications */}
            {notifications.slice(0, 3).map((notif, idx) => (
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
            <MenuItem
              onClick={() => {
                handleClose();
                setViewAllOpen(true);
              }}
              sx={{ justifyContent: "center", fontWeight: 600, color: "#002060" }}
            >
              View All
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Dialog for View All */}
      <Dialog
        open={viewAllOpen}
        onClose={() => setViewAllOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>All Notifications</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: "400px" }}>
          {notifications.length === 0 ? (
            <p>No notifications available.</p>
          ) : (
            notifications.map((notif, idx) => (
              <div key={idx} style={{ marginBottom: "12px" }}>
                <strong>{notif.message || "New notification"}</strong>
                {notif.priority && (
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: notif.priority === "high" ? "red" : "gray",
                    }}
                  >
                    {notif.priority.toUpperCase()}
                  </div>
                )}
                {notif.created_at && (
                  <div style={{ fontSize: "0.75rem", color: "gray" }}>
                    {formatDistanceToNow(new Date(notif.created_at), {
                      addSuffix: true,
                    })}
                  </div>
                )}
                <Divider sx={{ my: 1 }} />
              </div>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewAllOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NotificationMenu;
