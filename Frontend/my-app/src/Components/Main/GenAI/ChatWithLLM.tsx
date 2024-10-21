import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import { sendMessageToLLM } from './anythingLLMService';

const ChatWithLLM: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    try {
      const res = await sendMessageToLLM(message);
      setResponse(res.answer); // Adjust this based on your API response structure
    } catch (error) {
      setResponse('Error occurred while fetching the response.');
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Chat with Anything LLM
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Ask something..."
          variant="outlined"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          required
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth 
          sx={{ marginTop: 2 }} 
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </form>
      {response && (
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          Response: {response}
        </Typography>
      )}
    </Box>
  );
};

export default ChatWithLLM;
