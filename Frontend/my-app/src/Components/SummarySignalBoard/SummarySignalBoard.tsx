import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [selectedData, setSelectedData] = useState<DealData[]>([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Get initial tab from URL query parameter
  const initialTab = searchParams.get('tab') as CardType | null;

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

  // Auto-select card based on URL parameter or default to portfolio
  useEffect(() => {
    if (data && !selectedCard) {
      const cardToSelect = initialTab || 'portfolio';
      let deals: DealData[] = [];

      if (cardToSelect === 'upcoming') {
        deals = data.upcoming_deals.data;
      } else if (cardToSelect === 'portfolio') {
        deals = data.current_portfolio_deals.data;
      } else if (cardToSelect === 'recent') {
        deals = data.recently_traded_deals.data;
      }

      setSelectedCard(cardToSelect);
      setSelectedData(deals);
    }
  }, [data, selectedCard, initialTab]);

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
      title: 'Current Portfolio: IPOs',
      count: data.current_portfolio_deals.count,
      icon: WorkIcon,
      color: 'success',
    },
    {
      id: 'recent' as const,
      title: 'Recently Traded IPOs(Last 60 Days)',
      count: data.recently_traded_deals.count,
      icon: ScheduleIcon,
      color: 'warning',
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      <Box sx={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.5px',
              mb: 0.5,
            }}
          >
            Signal Board
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Click on a card to view detailed information about the deals in that category.
          </Typography>
        </Box>

        {/* Cards Grid - Compact Layout */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {cards.map((card) => {
            const borderColors: { [key: string]: string } = {
              primary: '#4f46e5',
              success: '#059669',
              warning: '#dc2626',
            };
            const isActive = selectedCard === card.id;

            return (
              <Grid item xs={12} sm={6} md={4} key={card.id}>
                <Card
                  onClick={() => handleCardClick(card.id)}
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: isActive ? `3px solid ${borderColors[card.color]}` : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    bgcolor: '#fff',
                    boxShadow: isActive ? `0 4px 12px ${borderColors[card.color]}30` : '0 1px 2px rgba(0, 0, 0, 0.05)',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: isActive
                        ? `0 6px 16px ${borderColors[card.color]}35`
                        : `0 8px 16px rgba(0, 0, 0, 0.12), inset 0 0 0 1px ${borderColors[card.color]}20`,
                      transform: 'translateY(-2px) scale(1.01)',
                      borderColor: isActive ? borderColors[card.color] : borderColors[card.color] + '60',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            mb: 0.5,
                            display: 'block',
                          }}
                        >
                          {card.title}
                        </Typography>

                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontSize: '1.75rem',
                            color: borderColors[card.color],
                            lineHeight: 1.1,
                            mb: 0.5,
                          }}
                        >
                          {card.count}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: '0.7rem',
                            color: '#9ca3af',
                            display: 'block',
                          }}
                        >
                          deals
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '8px',
                            bgcolor: borderColors[card.color] + '15',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                          }}
                        >
                          {card.id === 'upcoming' ? '📈' : card.id === 'portfolio' ? '💼' : '📊'}
                        </Box>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: borderColors[card.color] + '20',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                            opacity: 0.7,
                            transition: 'all 0.3s ease',
                          }}
                        >
                          ↗
                        </Box>
                      </Box>
                    </Box>
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
