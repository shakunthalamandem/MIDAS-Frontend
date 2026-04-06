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

  const filteredData = useMemo(() => {
    return selectedData.filter((deal) =>
      deal.ticker.toLowerCase().includes(searchTicker.toLowerCase())
    );
  }, [selectedData, searchTicker]);

  const getTableTitle = () => {
    switch (selectedCard) {
      case 'upcoming':
        return 'Upcoming IPOs';
      case 'portfolio':
        return 'Trading IPOs';
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
              <TableRow sx={{ bgcolor: '#cfe3f1' }}>
                <TableCell sx={{ fontWeight: 700 }}>Ticker</TableCell>
                {selectedCard === 'portfolio' && (
                  <>
                    <TableCell sx={{ fontWeight: 700 }}>Pricing Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 210 }}>
                      Sentiment Agent
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 250 }}>
                      Deal (IPO) Agent
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 240 }}>
                      Factors Based Agent
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>
                      Gator Signal
                    </TableCell>
                  </>
                )}
                {(selectedCard === 'upcoming' || selectedCard === 'recent') && (
                  <>
                    <TableCell sx={{ fontWeight: 700, minWidth: 210 }}>
                      Sentiment Agent
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 250 }}>
                      Deal (IPO) Agent
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 240 }}>
                      Factors Based Agent
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
