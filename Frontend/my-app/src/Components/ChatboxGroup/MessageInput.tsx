import React, { useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export default function MessageInput({ onSend }: { onSend: (t: string) => void }) {
  const [text, setText] = useState('');
  const submit = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };
  return (
    <Box sx={{ display: 'flex', gap: 1, p: 1 }}>
      <TextField fullWidth placeholder="Type a message" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); }} />
      <IconButton onClick={submit} aria-label="send"><SendIcon /></IconButton>
    </Box>
  );
}
