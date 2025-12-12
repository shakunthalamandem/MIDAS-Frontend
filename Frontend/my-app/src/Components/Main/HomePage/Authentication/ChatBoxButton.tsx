import React from "react";
import { IconButton, Typography, Zoom } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";

const chatButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  cursor: "pointer",
};

const ChatBoxButton: React.FC = () => {
  const handleOpenChat = () => {
    const chatUrl = `${window.location.origin}/chat`;
    window.open(chatUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Zoom in={true}>
      <div role="presentation" onClick={handleOpenChat} style={chatButtonStyle}>
        <IconButton
          aria-label="chat"
          sx={{
            backgroundColor: "#002060",
            color: "#ffffff",
            borderRadius: "50%",
            "&:hover": { backgroundColor: "#002060" },
          }}
        >
          <ChatIcon />
        </IconButton>
        <Typography variant="caption" sx={{ color: "#002060" }}>
          Deal Notes
        </Typography>
      </div>
    </Zoom>
  );
};

export default ChatBoxButton;
