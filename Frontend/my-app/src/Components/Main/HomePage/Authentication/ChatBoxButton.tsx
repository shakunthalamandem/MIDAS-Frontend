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

interface ChatBoxButtonProps {
  label?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

const ChatBoxButton: React.FC<ChatBoxButtonProps> = ({
  label = "Deal Notes",
  onClick,
  icon,
}) => {
  const handleOpenChat = () => {
    const chatUrl = `${window.location.origin}/chat`;
    window.open(chatUrl, "_blank", "noopener,noreferrer");
  };
  const handleClick = onClick ?? handleOpenChat;

  return (
    <Zoom in={true}>
      <div role="presentation" onClick={handleClick} style={chatButtonStyle}>
        <IconButton
          size="small"
          aria-label={label}
          sx={{
            backgroundColor: "#002060",
            color: "#ffffff",
            borderRadius: "50%",
            "&:hover": { backgroundColor: "#002060" },
          }}
        >
          {icon ?? <ChatIcon fontSize="small" />}
        </IconButton>
        <Typography variant="caption" sx={{ color: "#002060" }}>
          {label}
        </Typography>
      </div>
    </Zoom>
  );
};

export default ChatBoxButton;
