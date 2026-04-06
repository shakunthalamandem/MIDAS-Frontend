import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  TextField,
  TableSortLabel,
  useTheme,
} from '@mui/material';
import { CardType, DealData } from './types';
import {
  getSentimentColor,
  getPredictionColor,
  parseVolatilityOutlook,
  getPricingDate,
} from './utils';

interface SummarySignalBoardTableProps {
  selectedCard: CardType;
  selectedData: DealData[];
  onClose: () => void;
}

const SummarySignalBoardTable: React.FC<SummarySignalBoardTableProps> = ({
  selectedCard,
  selectedData,
  onClose,
}) => {
  const theme = useTheme();
  const [searchTicker, setSearchTicker] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('ticker');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredData = useMemo(() => {
    let filtered = selectedData.filter((deal) =>
      deal.ticker.toLowerCase().includes(searchTicker.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof DealData];
      let bValue: any = b[sortColumn as keyof DealData];

      if (sortColumn === 'sentiment_score') {
        aValue = a.sentiment?.sentiment_score ?? a.sentiment_summary?.socialmedia_retail_sentiment_score ?? 0;
        bValue = b.sentiment?.sentiment_score ?? b.sentiment_summary?.socialmedia_retail_sentiment_score ?? 0;
      }

      if (sortColumn === 'pricing_date') {
        aValue = a.unsupervised_summary?.pricing_date || a.pricing_date || a.trade_date || '';
        bValue = b.unsupervised_summary?.pricing_date || b.pricing_date || b.trade_date || '';
      }

      if (sortColumn === 'deal_agent') {
        const aOutlook = parseVolatilityOutlook(a.unsupervised_summary || a, a.ticker);
        const bOutlook = parseVolatilityOutlook(b.unsupervised_summary || b, b.ticker);
        aValue = aOutlook?.['1-Week Sentiment'] || aOutlook?.['1-Month Sentiment'] || '';
        bValue = bOutlook?.['1-Week Sentiment'] || bOutlook?.['1-Month Sentiment'] || '';
      }

      if (sortColumn === 'factors_agent') {
        aValue = a.ml_results?.t1w_pred || a.ml_results?.t1m_pred || '';
        bValue = b.ml_results?.t1w_pred || b.ml_results?.t1m_pred || '';
      }

      if (sortColumn === 'gator_signal') {
        aValue = a.jay_ritter?.overall_signal || '';
        bValue = b.jay_ritter?.overall_signal || '';
      }

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [selectedData, searchTicker, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getTableTitle = () => {
    switch (selectedCard) {
      case 'upcoming':
        return 'Upcoming IPOs';
      case 'portfolio':
        return 'Current Portfolio';
      case 'recent':
        return 'Recently Listed';
      default:
        return '';
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box>
          <Typography variant="h6" component="div">
            {getTableTitle()}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Showing {filteredData.length} deal{filteredData.length !== 1 ? 's' : ''} {searchTicker && `(filtered from ${selectedData.length})`}
          </Typography>
        </Box>
        <Button
          onClick={onClose}
          variant="text"
          size="small"
          sx={{ color: theme.palette.text.secondary }}
        >
          Close
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="Search by Ticker..."
          value={searchTicker}
          onChange={(e) => setSearchTicker(e.target.value)}
          size="small"
          sx={{
            width: '100%',
            maxWidth: '300px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />
      </Box>

      {selectedData.length > 0 ? (
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: '600px',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: theme.palette.background.paper,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.divider,
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            },
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                <TableCell sortDirection={sortColumn === 'ticker' ? sortDirection : false}>
                  <TableSortLabel
                    active={sortColumn === 'ticker'}
                    direction={sortColumn === 'ticker' ? sortDirection : 'asc'}
                    onClick={() => handleSort('ticker')}
                    sx={{ color: '#1565c0 !important', fontWeight: 700, fontSize: '0.9rem' }}
                  >
                    Ticker
                  </TableSortLabel>
                </TableCell>
                {selectedCard === 'portfolio' && (
                  <>
                    <TableCell sortDirection={sortColumn === 'pricing_date' ? sortDirection : false}>
                      <TableSortLabel
                        active={sortColumn === 'pricing_date'}
                        direction={sortColumn === 'pricing_date' ? sortDirection : 'asc'}
                        onClick={() => handleSort('pricing_date')}
                        sx={{ color: '#1565c0 !important', fontWeight: 700, fontSize: '0.9rem' }}
                      >
                        Pricing Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ minWidth: 210 }} sortDirection={sortColumn === 'sentiment_score' ? sortDirection : false}>
                      <TableSortLabel
                        active={sortColumn === 'sentiment_score'}
                        direction={sortColumn === 'sentiment_score' ? sortDirection : 'asc'}
                        onClick={() => handleSort('sentiment_score')}
                        sx={{ color: '#1565c0 !important', fontWeight: 700, fontSize: '0.9rem' }}
                      >
                        Sentiment Agent
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ minWidth: 250 }} sortDirection={sortColumn === 'deal_agent' ? sortDirection : false}>
                      <TableSortLabel
                        active={sortColumn === 'deal_agent'}
                        direction={sortColumn === 'deal_agent' ? sortDirection : 'asc'}
                        onClick={() => handleSort('deal_agent')}
                        sx={{ color: '#1565c0 !important', fontWeight: 700, fontSize: '0.9rem' }}
                      >
                        Deal (IPO) Agent
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ minWidth: 240 }} sortDirection={sortColumn === 'factors_agent' ? sortDirection : false}>
                      <TableSortLabel
                        active={sortColumn === 'factors_agent'}
                        direction={sortColumn === 'factors_agent' ? sortDirection : 'asc'}
                        onClick={() => handleSort('factors_agent')}
                        sx={{ color: '#1565c0 !important', fontWeight: 700, fontSize: '0.9rem' }}
                      >
                        Factors Based Agent
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ minWidth: 180 }} sortDirection={sortColumn === 'gator_signal' ? sortDirection : false}>
                      <TableSortLabel
                        active={sortColumn === 'gator_signal'}
                        direction={sortColumn === 'gator_signal' ? sortDirection : 'asc'}
                        onClick={() => handleSort('gator_signal')}
                        sx={{ color: '#1565c0 !important', fontWeight: 700, fontSize: '0.9rem' }}
                      >
                        Gator Signal
                      </TableSortLabel>
                    </TableCell>
                  </>
                )}
                {(selectedCard === 'upcoming' || selectedCard === 'recent') && (
                  <>
                    <TableCell sx={{ minWidth: 210 }} sortDirection={sortColumn === 'sentiment_score' ? sortDirection : false}>
                      <TableSortLabel
                        active={sortColumn === 'sentiment_score'}
                        direction={sortColumn === 'sentiment_score' ? sortDirection : 'asc'}
                        onClick={() => handleSort('sentiment_score')}
                        sx={{ color: '#1565c0 !important', fontWeight: 700, fontSize: '0.9rem' }}
                      >
                        Sentiment Agent
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ minWidth: 250 }} sortDirection={sortColumn === 'deal_agent' ? sortDirection : false}>
                      <TableSortLabel
                        active={sortColumn === 'deal_agent'}
                        direction={sortColumn === 'deal_agent' ? sortDirection : 'asc'}
                        onClick={() => handleSort('deal_agent')}
                        sx={{ color: '#1565c0 !important', fontWeight: 700, fontSize: '0.9rem' }}
                      >
                        Deal (IPO) Agent
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ minWidth: 240 }} sortDirection={sortColumn === 'factors_agent' ? sortDirection : false}>
                      <TableSortLabel
                        active={sortColumn === 'factors_agent'}
                        direction={sortColumn === 'factors_agent' ? sortDirection : 'asc'}
                        onClick={() => handleSort('factors_agent')}
                        sx={{ color: '#1565c0 !important', fontWeight: 700, fontSize: '0.9rem' }}
                      >
                        Factors Based Agent
                      </TableSortLabel>
                    </TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((deal, index) => {
                const volatilityOutlook = parseVolatilityOutlook(
                  deal.unsupervised_summary || deal,
                  deal.ticker
                );

                if (selectedCard === 'portfolio') {
                  return (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor: index % 2 === 0 ? '#fff' : '#fcfcfc',
                        '&:hover': {
                          bgcolor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>
                        {deal.ticker}
                      </TableCell>
                      <TableCell>{getPricingDate(deal, selectedCard)}</TableCell>

                      {/* Sentiment Agent Column */}
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, color: '#1a237e', fontSize: '0.75rem' }}
                          >
                            Score:{' '}
                            {deal.sentiment?.sentiment_score !== undefined &&
                            deal.sentiment.sentiment_score !== null
                              ? `${deal.sentiment.sentiment_score}/100`
                              : deal.sentiment_summary?.socialmedia_retail_sentiment_score !==
                                undefined
                              ? `${deal.sentiment_summary.socialmedia_retail_sentiment_score}/100`
                              : 'N/A'}
                          </Typography>
                          {(deal.sentiment?.one_week_sentiment ||
                            deal.sentiment_summary?.one_week_sentiment) && (
                            <Chip
                              label={`1W: ${
                                deal.sentiment?.one_week_sentiment ||
                                deal.sentiment_summary?.one_week_sentiment
                              }`}
                              size="small"
                              color={getSentimentColor(
                                deal.sentiment?.one_week_sentiment ||
                                  deal.sentiment_summary?.one_week_sentiment
                              )}
                              sx={{ width: 'fit-content', fontWeight: 600 }}
                            />
                          )}
                          {(deal.sentiment?.one_month_sentiment ||
                            deal.sentiment_summary?.one_month_sentiment) && (
                            <Chip
                              label={`1M: ${
                                deal.sentiment?.one_month_sentiment ||
                                deal.sentiment_summary?.one_month_sentiment
                              }`}
                              size="small"
                              color={getSentimentColor(
                                deal.sentiment?.one_month_sentiment ||
                                  deal.sentiment_summary?.one_month_sentiment
                              )}
                              sx={{ width: 'fit-content', fontWeight: 600 }}
                            />
                          )}
                        </Box>
                      </TableCell>

                      {/* Deal (IPO) Agent Column */}
                      <TableCell>
                        {volatilityOutlook ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {volatilityOutlook['1-Week Sentiment'] && (
                              <Chip
                                label={`1W: ${volatilityOutlook['1-Week Sentiment']}`}
                                size="small"
                                color={getSentimentColor(
                                  volatilityOutlook['1-Week Sentiment']
                                )}
                                sx={{ width: 'fit-content', fontWeight: 600 }}
                              />
                            )}
                            {volatilityOutlook['1-Month Sentiment'] && (
                              <Chip
                                label={`1M: ${volatilityOutlook['1-Month Sentiment']}`}
                                size="small"
                                color={getSentimentColor(
                                  volatilityOutlook['1-Month Sentiment']
                                )}
                                sx={{ width: 'fit-content', fontWeight: 600 }}
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>

                      {/* Factors Based Agent Column */}
                      <TableCell>
                        {deal.ml_results &&
                        (deal.ml_results.t1w_pred || deal.ml_results.t1m_pred) ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {deal.ml_results.t1w_pred && (
                              <Chip
                                label={`1W: ${deal.ml_results.t1w_pred}`}
                                size="small"
                                color={getPredictionColor(deal.ml_results.t1w_pred)}
                                sx={{ width: 'fit-content', fontWeight: 600 }}
                              />
                            )}
                            {deal.ml_results.t1m_pred && (
                              <Chip
                                label={`1M: ${deal.ml_results.t1m_pred}`}
                                size="small"
                                color={getPredictionColor(deal.ml_results.t1m_pred)}
                                sx={{ width: 'fit-content', fontWeight: 600 }}
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>

                      {/* Gator Signal Column */}
                      <TableCell>
                        {deal.jay_ritter?.overall_signal ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Chip
                              label={deal.jay_ritter.overall_signal}
                              size="small"
                              color={
                                deal.jay_ritter.overall_signal.toLowerCase() === 'long'
                                  ? 'success'
                                  : deal.jay_ritter.overall_signal.toLowerCase() === 'short'
                                  ? 'error'
                                  : 'warning'
                              }
                              sx={{ fontWeight: 700, width: 'fit-content' }}
                            />
                            <Typography variant="caption" color="textSecondary">
                              {deal.jay_ritter.confidence_score}% confidence
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                } else {
                  // Detailed layout for Upcoming and Recently Listed
                  return (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor: index % 2 === 0 ? '#fff' : '#fcfcfc',
                        '&:hover': {
                          bgcolor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>
                        {deal.ticker}
                      </TableCell>

                      {/* Sentiment Agent Column */}
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, color: '#1a237e', fontSize: '0.75rem' }}
                          >
                            Score:{' '}
                            {deal.sentiment?.sentiment_score !== undefined &&
                            deal.sentiment.sentiment_score !== null
                              ? `${deal.sentiment.sentiment_score}/100`
                              : deal.sentiment_summary?.socialmedia_retail_sentiment_score !==
                                undefined
                              ? `${deal.sentiment_summary.socialmedia_retail_sentiment_score}/100`
                              : deal.sentiment_summary?.sentiment_score !== undefined
                              ? `${deal.sentiment_summary.sentiment_score}/100`
                              : 'N/A'}
                          </Typography>
                          {(deal.sentiment?.one_week_sentiment ||
                            deal.sentiment_summary?.one_week_sentiment) && (
                            <Chip
                              label={`1W: ${
                                deal.sentiment?.one_week_sentiment ||
                                deal.sentiment_summary?.one_week_sentiment
                              }`}
                              size="small"
                              color={getSentimentColor(
                                deal.sentiment?.one_week_sentiment ||
                                  deal.sentiment_summary?.one_week_sentiment
                              )}
                              sx={{ width: 'fit-content', fontWeight: 600 }}
                            />
                          )}
                          {(deal.sentiment?.one_month_sentiment ||
                            deal.sentiment_summary?.one_month_sentiment) && (
                            <Chip
                              label={`1M: ${
                                deal.sentiment?.one_month_sentiment ||
                                deal.sentiment_summary?.one_month_sentiment
                              }`}
                              size="small"
                              color={getSentimentColor(
                                deal.sentiment?.one_month_sentiment ||
                                  deal.sentiment_summary?.one_month_sentiment
                              )}
                              sx={{ width: 'fit-content', fontWeight: 600 }}
                            />
                          )}
                          {!deal.sentiment?.one_week_sentiment &&
                            !deal.sentiment_summary?.one_week_sentiment &&
                            !deal.sentiment?.one_month_sentiment &&
                            !deal.sentiment_summary?.one_month_sentiment && (
                              <Typography variant="caption" color="textSecondary">
                                N/A
                              </Typography>
                            )}
                        </Box>
                      </TableCell>

                      {/* Deal (IPO) Agent Column */}
                      <TableCell>
                        {volatilityOutlook ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {volatilityOutlook['1-Week Sentiment'] && (
                              <Chip
                                label={`1W: ${volatilityOutlook['1-Week Sentiment']}`}
                                size="small"
                                color={getSentimentColor(
                                  volatilityOutlook['1-Week Sentiment']
                                )}
                                sx={{ width: 'fit-content', fontWeight: 600 }}
                              />
                            )}
                            {volatilityOutlook['1-Month Sentiment'] && (
                              <Chip
                                label={`1M: ${volatilityOutlook['1-Month Sentiment']}`}
                                size="small"
                                color={getSentimentColor(
                                  volatilityOutlook['1-Month Sentiment']
                                )}
                                sx={{ width: 'fit-content', fontWeight: 600 }}
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>

                      {/* Factors Based Agent Column */}
                      <TableCell>
                        {deal.ml_results &&
                        (deal.ml_results.t1w_pred || deal.ml_results.t1m_pred) ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {deal.ml_results.t1w_pred && (
                              <Chip
                                label={`1W: ${deal.ml_results.t1w_pred}`}
                                size="small"
                                color={getPredictionColor(deal.ml_results.t1w_pred)}
                                sx={{ width: 'fit-content', fontWeight: 600 }}
                              />
                            )}
                            {deal.ml_results.t1m_pred && (
                              <Chip
                                label={`1M: ${deal.ml_results.t1m_pred}`}
                                size="small"
                                color={getPredictionColor(deal.ml_results.t1m_pred)}
                                sx={{ width: 'fit-content', fontWeight: 600 }}
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                }
              })}
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
    </Box>
  );
};

export default SummarySignalBoardTable;
