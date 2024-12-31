import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, MenuItem, Box, Typography } from '@mui/material';

interface Ticker {
  id: number;
  ticker: string;
}

interface TickerDropdownProps {
  onSelectTicker: (ticker: string) => void;
}

const TickerDropdown: React.FC<TickerDropdownProps> = ({ onSelectTicker }) => {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [filteredTickers, setFilteredTickers] = useState<Ticker[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        if (!apiUrl) throw new Error('API URL is not defined in environment variables');
        const response = await axios.get<Ticker[]>(`${apiUrl}/populate-invested-tickers/`);
        setTickers(response.data);
        setFilteredTickers(response.data);
      } catch (error) {
        console.error('Error fetching tickers:', error);
      }
    };
    fetchTickers();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    const filtered = tickers.filter((ticker) =>
      ticker.ticker.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTickers(filtered);
  };

  const handleSelectTicker = (ticker: string) => {
    onSelectTicker(ticker);
    setSearchTerm('');
    setShowDropdown(false);
  };

  return (
    <Box sx={{ textAlign: 'center', marginTop: '50px' }}>
      <Box
        sx={{ display: 'inline-block', textAlign: 'left', position: 'relative' }}
        onMouseEnter={() => setShowDropdown(true)}
        onMouseLeave={() => setShowDropdown(false)}
      >
        <TextField
          id="ticker-search"
          label="Search Ticker"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ marginBottom: '10px', width: '300px' }}
        />
        {showDropdown && (
          <Box
            sx={{
              border: '1px solid #ccc',
              borderRadius: '4px',
              maxHeight: '250px',
              overflowY: 'auto',
              backgroundColor: '#fff',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
              position: 'absolute',
              width: '100%',
              zIndex: 10,
            }}
          >
            {filteredTickers.map((ticker) => (
              <MenuItem
                key={ticker.id}
                onClick={() => handleSelectTicker(ticker.ticker)}
                sx={{ cursor: 'pointer' }}
              >
                {ticker.ticker}
              </MenuItem>
            ))}
            {filteredTickers.length === 0 && (
              <Typography sx={{ padding: '10px', textAlign: 'center', color: '#888' }}>
                No tickers found
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TickerDropdown;
