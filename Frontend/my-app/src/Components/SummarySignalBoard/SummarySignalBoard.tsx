import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  useTheme,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SummarySignalBoardTable from './SummarySignalBoardTable';
import { CardType, DealData, SummaryData } from './types';

const SummarySignalBoard: React.FC = () => {
  const theme = useTheme();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [selectedData, setSelectedData] = useState<DealData[]>([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');

        if (!token) {
          throw new Error('Authentication token not found. Please login first.');
        }

        const response = await fetch(`${apiUrl}/api/summary_signal_board/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem('access_token');
          throw new Error('Your session has expired. Please login again.');
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch signal board data: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Signal Board API Response:', result);
        console.log('Upcoming Deals Sample:', result.upcoming_deals?.data?.[0]);
        setData(result);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  const handleCardClick = (type: CardType) => {
    if (!data) return;

    let deals: DealData[] = [];
    if (type === 'upcoming') {
      deals = data.upcoming_deals.data;
    } else if (type === 'portfolio') {
      deals = data.current_portfolio_deals.data;
    } else {
      deals = data.recently_traded_deals.data;
    }

    setSelectedCard(type);
    setSelectedData(deals);
  };

  const handleCloseTable = () => {
    setSelectedCard(null);
    setSelectedData([]);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor={theme.palette.background.default}
      >
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            Loading Signal Board...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor={theme.palette.background.default}
      >
        <Box textAlign="center">
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            Error: {error}
          </Typography>
          <button onClick={() => window.location.reload()}>Retry</button>
        </Box>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  const cards = [
    {
      id: 'upcoming' as const,
      title: 'Upcoming IPOs',
      count: data.upcoming_deals.count,
      icon: TrendingUpIcon,
      color: 'primary',
    },
    {
      id: 'portfolio' as const,
      title: 'Trading IPOs',
      count: data.current_portfolio_deals.count,
      icon: WorkIcon,
      color: 'success',
    },
    {
      id: 'recent' as const,
      title: 'Recently Listed',
      count: data.recently_traded_deals.count,
      icon: ScheduleIcon,
      color: 'warning',
    },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      <Box sx={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Signal Board
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Real-time IPO market sentiment and analysis
          </Typography>
        </Box>

        {/* Cards Grid - Horizontal Layout */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={card.id}>
                <Card
                  onClick={() => handleCardClick(card.id)}
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                      <Icon
                        sx={{
                          fontSize: 20,
                          color: `${card.color}.main`,
                        }}
                      />
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        color: theme.palette.text.secondary,
                        textTransform: 'uppercase',
                        mb: 1,
                        display: 'block',
                      }}
                    >
                      {card.title}
                    </Typography>

                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        fontSize: '2rem',
                      }}
                    >
                      {card.count}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Data Table - Inline */}
        {selectedCard && (
          <SummarySignalBoardTable
            selectedCard={selectedCard}
            selectedData={selectedData}
            onClose={handleCloseTable}
          />
        )}
      </Box>
    </Box>
  );
};

export default SummarySignalBoard;
