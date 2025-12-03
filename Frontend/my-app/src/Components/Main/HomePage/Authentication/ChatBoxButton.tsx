import React, { useState } from "react";
import { IconButton, Zoom, Paper } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import MattermostChat from "../../../Discussion/MattermostChat";
// import Remark42 from "../../../Discussion/Remark42";

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

const chatWindowStyle: React.CSSProperties = {
  padding: "0px",
  borderRadius: "10px",
  backgroundColor: "#ffffff",
  boxShadow: "0px 0px 10px rgba(0,0,0,0.3)",
  overflow: "auto",
};

const ChatBoxButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  const toggleChat = () => setOpen((prev) => !prev);

  return (
    <>
      {/* Remark42 Popup */}
      {open && (
        <Paper elevation={4}>
          {/* <Remark42 pageId="blog-post-1" /> */}
          <MattermostChat />
        </Paper>
      )}

      {/* Floating Chat Button */}
      <Zoom in={true}>
        <div role="presentation" onClick={toggleChat} style={chatButtonStyle}>
          <IconButton aria-label="chat">
            <ChatIcon style={{ color: "#ffffff" }} />
          </IconButton>
        </div>
      </Zoom>
    </>
  );
};

export default ChatBoxButton;
