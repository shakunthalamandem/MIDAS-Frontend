import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Container,
} from '@mui/material';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const TickerChange: React.FC = () => {
  const [oldTicker, setOldTicker] = useState('');
  const [newTicker, setNewTicker] = useState('');
  const [dealType, setDealType] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem("access_token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/ticker_change/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          old_ticker: oldTicker.toUpperCase(),
          new_ticker: newTicker.toUpperCase(),
          deal_type: dealType,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        let errorMsg = 'Failed to change ticker';
        try {
          const errorData = JSON.parse(txt);
          errorMsg = errorData.error || errorMsg;
        } catch {
          errorMsg = txt || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const data = await res.json().catch(() => null);
      setMessage(data?.message || 'Ticker changed successfully!');
      setOldTicker('');
      setNewTicker('');
      setDealType('');
    } catch (e: any) {
      setError(e?.message || 'Failed to change ticker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom align="center">
            Ticker Change
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3} sx={{ mt: 3 }}>
              <FormControl fullWidth required>
                <InputLabel>Deal Type</InputLabel>
                <Select
                  value={dealType}
                  label="Deal Type"
                  onChange={(e) => setDealType(e.target.value)}
                  disabled={loading}
                >
                  <MenuItem value="IPO">IPO</MenuItem>
                  <MenuItem value="FO">FO</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                required
                label="Old Ticker"
                value={oldTicker}
                onChange={(e) => setOldTicker(e.target.value.toUpperCase())}
                disabled={loading}
                placeholder="BTGO-US"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />

              <TextField
                fullWidth
                required
                label="New Ticker"
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                disabled={loading}
                placeholder="NEWT-US"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />

              {message && (
                <Alert severity="success" onClose={() => setMessage('')}>
                  {message}
                </Alert>
              )}

              {error && (
                <Alert severity="error" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!oldTicker || !newTicker || !dealType || loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Updating...' : 'Update Ticker'}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default TickerChange;