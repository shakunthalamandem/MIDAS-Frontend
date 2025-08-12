import React from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useChatSocket } from './useChatSocket';


export default function ChatGroup({ groupId, user }: { groupId: string; user: any }) {
  const wsUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/ws/chat/';
  const { connected, messages, sendMessage } = useChatSocket(wsUrl, groupId, user?.token);

  return (
    <Paper elevation={6} sx={{ display: 'flex', flexDirection: 'column', height: '80vh', width: '100%', borderRadius: 2 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Group: {groupId}</Typography>
        <Typography variant="caption" color={connected ? 'green' : 'text.secondary'}>{connected ? 'Connected' : 'Connecting...'}</Typography>
      </Box>
      <Divider />
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <MessageList messages={messages} currentUserId={user.id} />
      </Box>
      <Divider />
      <MessageInput onSend={(t) => sendMessage(t, user)} />
    </Paper>
  );
}