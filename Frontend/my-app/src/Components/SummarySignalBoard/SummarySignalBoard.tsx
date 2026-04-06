import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import ScheduleIcon from '@mui/icons-material/Schedule';

interface DealData {
  ticker: string;
  issuer_name?: string;
  pricing_date?: string;
  sentiment?: any;
  ml_results?: any;
  deal_status?: string;
  trade_date?: string;
  [key: string]: any;
}

interface SummaryData {
  upcoming_deals: {
    count: number;
    data: DealData[];
  };
  current_portfolio_deals: {
    count: number;
    data: DealData[];
  };
  recently_traded_deals: {
    count: number;
    data: DealData[];
  };
}

const SummarySignalBoard: React.FC = () => {
  const theme = useTheme();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<DealData[]>([]);
const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');

        // Check if token exists
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

        // Handle unauthorized response
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          throw new Error('Your session has expired. Please login again.');
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch signal board data: ${response.statusText}`);
        }

        const result = await response.json();
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

  const handleCardClick = (type: 'upcoming' | 'portfolio' | 'recent') => {
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
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
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
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  const cards = [
    {
      id: 'upcoming',
      title: 'Upcoming Deals',
      count: data.upcoming_deals.count,
      icon: TrendingUpIcon,
      color: 'primary',
    },
    {
      id: 'portfolio',
      title: 'Current Portfolio',
      count: data.current_portfolio_deals.count,
      icon: WorkIcon,
      color: 'success',
    },
    {
      id: 'recent',
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

        {/* Cards Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={card.id}>
                <Card
                  onClick={() => handleCardClick(card.id as 'upcoming' | 'portfolio' | 'recent')}
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12],
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      mb={2}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: `${card.color}.light`,
                        }}
                      >
                        <Icon
                          sx={{
                            fontSize: 28,
                            color: `${card.color}.main`,
                          }}
                        />
                      </Box>
                    </Box>

                    <Typography
                      color="textSecondary"
                      sx={{ fontSize: '0.875rem', mb: 1 }}
                    >
                      {card.title}
                    </Typography>

                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        mb: 0.5,
                      }}
                    >
                      {card.count}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="textSecondary"
                    >
                      {card.count === 1 ? 'Deal' : 'Deals'}
                    </Typography>

                    <Box
                      sx={{
                        mt: 2,
                        height: 4,
                        bgcolor: theme.palette.divider,
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: '40%',
                          bgcolor: `${card.color}.main`,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Data Table Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" component="div">
                {selectedCard === 'upcoming' && 'Upcoming Deals'}
                {selectedCard === 'portfolio' && 'Current Portfolio'}
                {selectedCard === 'recent' && 'Recently Listed'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Showing {selectedData.length} deal{selectedData.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedData.length > 0 ? (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                      <TableCell sx={{ fontWeight: 700 }}>Ticker</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Company Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Pricing Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Sentiment</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedData.map((deal, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          '&:hover': {
                            bgcolor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>
                          {deal.ticker}
                        </TableCell>
                        <TableCell>
                          {deal.issuer_name || deal.company || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {deal.pricing_date || deal.trade_date || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <SentimentBadge
                            sentiment={
                              deal.sentiment?.one_week_sentiment ||
                              deal.sentiment?.sentiment ||
                              'N/A'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <StatusBadge deal={deal} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography color="textSecondary">
                  No deals found for this category.
                </Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
};

// Sentiment Badge Component
const SentimentBadge: React.FC<{ sentiment: string }> = ({ sentiment }) => {
  const sentimentValue = String(sentiment).toLowerCase();

  let color: 'success' | 'error' | 'warning' | 'default' = 'default';
  if (sentimentValue.includes('bullish') || sentimentValue.includes('positive')) {
    color = 'success';
  } else if (sentimentValue.includes('bearish') || sentimentValue.includes('negative')) {
    color = 'error';
  } else if (sentimentValue.includes('neutral')) {
    color = 'warning';
  }

  return (
    <Chip
      label={sentiment || 'N/A'}
      color={color}
      variant="outlined"
      size="small"
    />
  );
};

// Status Badge Component
const StatusBadge: React.FC<{ deal: DealData }> = ({ deal }) => {
  const status = deal.deal_status || deal.status || 'Active';

  const statusColorMap: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' } = {
    issued: 'primary',
    announced: 'info',
    active: 'success',
    completed: 'default',
  };

  const color = statusColorMap[status.toLowerCase()] || 'default';

  return (
    <Chip
      label={status}
      color={color}
      variant="outlined"
      size="small"
    />
  );
};

export default SummarySignalBoard;
