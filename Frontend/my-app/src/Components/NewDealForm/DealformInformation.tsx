import React, { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  InputAdornment,
  CircularProgress,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Define the type for each result
interface Data {
  ticker: string;
}

const DealformInformation = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [results, setResults] = useState<Data[]>([]); // Fix to array of Data
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedTicker, setSelectedTicker] = useState<string>('');
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('access_token');

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Construct the API URL by embedding the search term directly into the endpoint
      const response = await fetch(`${apiUrl}/api/new-deal/search/${query}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const data = await response.json();
      setResults(data); // Assuming the API returns an array of results
    } catch (error) {
      console.error('Error fetching search results:', error);
      setError('An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (ticker: string) => {
    setSelectedTicker(ticker);
    setSearchTerm('');
    setResults([]);
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Box sx={{ width: '100%', padding: 2 }}>
        <TextField
          label="Search Global Equity Market Deals"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          autoComplete="off"
          placeholder="Enter ticker symbol..."
          style={{
            marginBottom: '20px',
            minWidth: '300px',
            backgroundColor: '#f4f6f9',
            borderRadius: '8px',
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#656565' }} />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <CircularProgress />
        ) : (
          searchTerm.length > 0 && (
            <Paper
              elevation={3}
              style={{
                padding: '10px',
                maxWidth: '280px',
                maxHeight: '300px',
                overflowY: 'auto',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
              }}
            >
              {results.length === 0 ? (
                <Typography variant="body2" color="textSecondary" align="center">
                  No results found.
                </Typography>
              ) : (
                <List>
                  {results.map((item: Data, index: number) => (
                    <ListItem
                      key={index}
                      onClick={() => handleItemClick(item.ticker)}
                      component="li"
                      style={{
                        backgroundColor:
                          selectedTicker === item.ticker
                            ? 'rgba(63, 81, 181, 0.1)'
                            : 'transparent',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s',
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = '#f0f0f0')
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          selectedTicker === item.ticker
                            ? 'rgba(63, 81, 181, 0.1)'
                            : 'transparent')
                      }
                    >
                      <ListItemText primary={<strong>{item.ticker}</strong>} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          )
        )}
      </Box>

      {/* Display selected ticker */}
      {selectedTicker && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6">Selected Ticker: {selectedTicker}</Typography>
        </Box>
      )}
    </Container>
  );
};

export default DealformInformation;
