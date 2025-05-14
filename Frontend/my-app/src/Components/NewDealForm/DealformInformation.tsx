import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 
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
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NewDealFormMainTable from './NewDealFormMainTable';
import BasicInfo from './BasicInfo';
import SelectedTicker from '../Main/MonasheeGraphs/SelectedTicker';
import MDDSelectedTicker from '../Main/MonasheeDeals/MddGraphs/MDDSelectedTicker';

interface Data {
  ticker: string;
}

const DealformInformation = () => {
  const location = useLocation();
  const passedTicker = location.state?.ticker; 

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [results, setResults] = useState<Data[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedTicker, setSelectedTicker] = useState<{ ticker: string }>({
    ticker: passedTicker || 'SARO', 
  });

  useEffect(() => {
    if (passedTicker) {
      setSelectedTicker({ ticker: passedTicker });
    }
  }, [passedTicker]);

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
      const response = await fetch(`${apiUrl}/api/new_deal_search/${query.toUpperCase()}/`, {
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
      const formattedResults = data.map((item: Data) => ({
        ...item,
        ticker: item.ticker.toUpperCase(),
      }));

      setResults(formattedResults);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setError('An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (ticker: string) => {
    setSelectedTicker({ ticker: ticker.toUpperCase() });
    setSearchTerm('');
    setResults([]);
  };

  return (
    <>
     <Box
        sx={{
          fontWeight: 500,
          color: "#FFFFFF",
          fontSize: { xs: "1rem", sm: "1.2rem" },
          backgroundColor: "#002060",
          textAlign: "center",
          py: 1,
          borderRadius: 2,
          mb: 2,
          boxShadow: 2,
        }}
      >
Welcome to the Deal Information Form! Easily input all relevant details and track key deal parameters, from pricing and terms to deadlines and special conditions.      </Box>
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4,marginTop:2 }}>
  

  <CardContent>
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      flexWrap="wrap"
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          minWidth: 'fit-content',
          color: '#002060',
        }}
      >
        Deal Information Form
      </Typography>

      <TextField
        label="Search Ticker"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearch}
        autoComplete="off"
        placeholder="Enter ticker symbol..."
        size="small"
        sx={{
          flexGrow: 1,
          maxWidth: 200,
          backgroundColor: '#f9f9f9',
          borderRadius: 1,
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  </CardContent>
{/* </Card> */}


      {/* Autocomplete dropdown */}
      {loading ? (
        <CircularProgress />
      ) : (
        searchTerm.length > 0 && (
          <Paper
            elevation={3}
            sx={{
              padding: 1,
              marginLeft:110,
              maxHeight: 300,
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              borderRadius: 2,
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
                    sx={{
                      backgroundColor:
                        selectedTicker.ticker === item.ticker
                          ? 'rgba(63, 81, 181, 0.1)'
                          : 'transparent',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                      },
                    }}
                  >
                    <ListItemText primary={<strong>{item.ticker}</strong>} />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        )
      )}

      {/* Conditional Rendering */}
      {selectedTicker.ticker ? (
  <>
    <NewDealFormMainTable selecteditems={selectedTicker} />
    <MDDSelectedTicker ticker={selectedTicker.ticker} />
  </>
) : (
  <BasicInfo />
)}

    </Container>
    </>
  );
};

export default DealformInformation;
