import React from "react";
import { IconButton, Zoom } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";

const chatButtonStyle: React.CSSProperties = {
  // position: "fixed",
  // bottom: "70px",
  // right: "10px",
  backgroundColor: "#002060",
  color: "#ffffff",
  borderRadius: "50%",
  cursor: "pointer",
  transition: "opacity 0.3s ease-in-out",
  // zIndex: 99999,
};

const ChatBoxButton: React.FC = () => {
  const handleOpenChat = () => {
    const chatUrl = `${window.location.origin}/chat`;
    window.open(chatUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Zoom in={true}>
        <div role="presentation" onClick={handleOpenChat} style={chatButtonStyle}>
          <IconButton aria-label="chat">
            <ChatIcon style={{ color: "#ffffff" }} />
          </IconButton>
        </div>
      </Zoom>
    </>
  );
};

export default ChatBoxButton;
