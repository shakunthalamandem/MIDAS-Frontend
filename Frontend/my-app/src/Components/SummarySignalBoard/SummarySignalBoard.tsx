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
        {/* Header with Tabs on Right */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 3,
            gap: 2,
          }}
        >
          <Box>
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
              Select a category to view deals and their signals.
            </Typography>
          </Box>

          {/* Tab Buttons - Right Side */}
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              alignItems: 'flex-start',
              pt: 0.5,
            }}
          >
          {cards.map((card) => {
            const isActive = selectedCard === card.id;
            const activeColor = '#4f46e5';
            const activeBg = '#eef2ff';

            return (
              <Box
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2.5,
                  py: 1.2,
                  borderRadius: '8px',
                  border: `2px solid ${isActive ? activeColor : '#d4e3f8'}`,
                  backgroundColor: isActive ? activeBg : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: isActive ? activeColor : '#b6ccee',
                    backgroundColor: isActive ? activeBg : '#deebf8',
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? activeColor : '#313233',
                    transition: 'color 0.25s ease',
                  }}
                >
                  {card.id === 'upcoming'
                    ? 'Upcoming IPOs'
                    : card.id === 'portfolio'
                    ? 'Current Portfolio'
                    : 'Recently Traded'}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '24px',
                    height: '24px',
                    borderRadius: '12px',
                    backgroundColor: isActive ? activeColor : '#e5e7eb',
                    color: isActive ? '#ffffff' : '#6b7280',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    transition: 'all 0.25s ease',
                  }}
                >
                  {card.count}
                </Box>
              </Box>
            );
          })}
          </Box>
        </Box>

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
