// ChatboxMain.tsx
import React from "react";
import ChatGroup from "./ChatGroup";
import { ThemeProvider } from "@mui/material";
import theme from "./Hooks/theme";

const ChatboxMain: React.FC = () => {
  // Temporary mock user — replace with actual logged-in user from Django auth
  const mockUser = { id: "user-1", username: "ranjith" };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: 24, display: "grid", placeItems: "center" }}>
        <ChatGroup groupId="general" user={mockUser} />
      </div>
    </ThemeProvider>
  );
};

export default ChatboxMain;
