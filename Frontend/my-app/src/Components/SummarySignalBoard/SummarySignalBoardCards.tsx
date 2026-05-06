import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  TextField,
  InputAdornment,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { CardType, DealData } from './types';
import {
  getSentimentColor,
  getPredictionColor,
  getQuantSignalColor,
  getGatorSignalColor,
  parseVolatilityOutlook,
  getPricingDate,
} from './utils';

interface SummarySignalBoardCardsProps {
  selectedCard: CardType;
  selectedData: DealData[];
  onClose: () => void;
}

const SummarySignalBoardCardsList: React.FC<SummarySignalBoardCardsProps> = ({
  selectedCard,
  selectedData,
  onClose,
}) => {
  const navigate = useNavigate();
  const [searchTicker, setSearchTicker] = useState('');

  const filteredData = useMemo(() => {
    return selectedData.filter((deal) =>
      deal.ticker.toLowerCase().includes(searchTicker.toLowerCase())
    );
  }, [selectedData, searchTicker]);

  const handleTickerClick = (deal: DealData) => {
    const ticker = deal.ticker;
    const pricingDate = getPricingDate(deal, selectedCard);
    const issuerName = deal.issuer_name || '';

    const params = new URLSearchParams({
      ticker: ticker,
      pricing_date: pricingDate,
      issuer_name: issuerName,
      flag_for_writeup: 'Y',
    }).toString();

    window.open(`/deals/new_dashboard/details?${params}`, '_blank');
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

  const getSentimentScore = (deal: DealData) => {
    return (
      deal.sentiment?.socialmedia_retail_sentiment_score ??
      deal.sentiment_summary?.socialmedia_retail_sentiment_score ??
      null
    );
  };

  return (
    <Box sx={{ mt: 4 }}>
      {/* Header with Search */}
      <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #e5e7eb' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#111827', mb: 0.3 }}>
              {getTableTitle()}: {filteredData.length} deal{filteredData.length !== 1 ? 's' : ''}
            </Typography>
            {searchTicker && (
              <Typography sx={{ fontSize: '0.85rem', color: '#6b7280' }}>
                Filtered from {selectedData.length} deals
              </Typography>
            )}
          </Box>

          {/* Search Bar */}
          <TextField
            placeholder="Search ticker..."
            value={searchTicker}
            onChange={(e) => setSearchTicker(e.target.value)}
            size="small"
            variant="outlined"
            sx={{
              width: '100%',
              maxWidth: '280px',
              ml: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: '#f3f4f6',
                fontSize: '0.9rem',
                '&:hover': {
                  backgroundColor: '#f9fafb',
                },
                '&.Mui-focused': {
                  backgroundColor: '#fff',
                  '& fieldset': {
                    borderColor: '#4f46e5',
                    borderWidth: '2px',
                  },
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9ca3af', fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {filteredData.length > 0 ? (
        <Grid container spacing={2.5}>
          {filteredData.map((deal, index) => {
            const volatilityOutlook = parseVolatilityOutlook(
              deal.unsupervised_summary || deal,
              deal.ticker
            );
            const sentimentScore = getSentimentScore(deal);

            return (
              <Grid item xs={12} sm={6} lg={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '14px',
                    backgroundColor: '#fff',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: '#4f46e5',
                    },
                    '&:hover': {
                      boxShadow: '0 12px 24px rgba(79, 70, 229, 0.15)',
                      transform: 'translateY(-4px)',
                      borderColor: '#4f46e5',
                    },
                  }}
                  onClick={() => handleTickerClick(deal)}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Header Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '1.65rem', fontWeight: 900, color: '#4f46e5', lineHeight: 1.1 }}>
                          {deal.ticker}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.8rem',
                            color: '#6b7280',
                            fontWeight: 500,
                            mt: 0.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {deal.issuer_name || 'N/A'}
                        </Typography>
                      </Box>

                      {/* Sentiment Badge */}
                      {sentimentScore !== null && (
                        <Box
                          sx={{
                            textAlign: 'center',
                            bgcolor: '#ede9fe',
                            borderRadius: '12px',
                            p: '8px 12px',
                            minWidth: '70px',
                            ml: 1.5,
                          }}
                        >
                          <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#4f46e5', lineHeight: 1 }}>
                            {Math.round(sentimentScore)}
                          </Typography>
                          <Typography sx={{ fontSize: '0.65rem', color: '#6366f1', fontWeight: 700, mt: 0.3 }}>
                            SCORE
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Trade Date */}
                    {(selectedCard === 'portfolio' || selectedCard === 'recent') && (
                      <Typography sx={{ fontSize: '0.8rem', color: '#9ca3af', mb: 1.5, fontWeight: 500 }}>
                        📅 {deal.unsupervised_summary?.trade_date || deal.trade_date || 'N/A'}
                      </Typography>
                    )}

                    {/* Divider */}
                    <Box sx={{ height: '1px', bgcolor: '#e5e7eb', mb: 1.5 }} />

                    {/* Signals Grid - Compact Layout */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      {/* 1W Sentiment */}
                      {(deal.sentiment?.one_week_sentiment || deal.sentiment_summary?.one_week_sentiment) && (
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', color: '#6b7280', mb: 0.4, fontWeight: 700, textTransform: 'uppercase' }}>
                            1W Sentiment
                          </Typography>
                          <Chip
                            label={deal.sentiment?.one_week_sentiment || deal.sentiment_summary?.one_week_sentiment}
                            size="small"
                            color={getSentimentColor(
                              deal.sentiment?.one_week_sentiment || deal.sentiment_summary?.one_week_sentiment
                            )}
                            sx={{ fontWeight: 800, fontSize: '0.75rem', width: '100%', height: '28px' }}
                          />
                        </Box>
                      )}

                      {/* 1M Sentiment */}
                      {(deal.sentiment?.one_month_sentiment || deal.sentiment_summary?.one_month_sentiment) && (
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', color: '#6b7280', mb: 0.4, fontWeight: 700, textTransform: 'uppercase' }}>
                            1M Sentiment
                          </Typography>
                          <Chip
                            label={deal.sentiment?.one_month_sentiment || deal.sentiment_summary?.one_month_sentiment}
                            size="small"
                            color={getSentimentColor(
                              deal.sentiment?.one_month_sentiment || deal.sentiment_summary?.one_month_sentiment
                            )}
                            sx={{ fontWeight: 800, fontSize: '0.75rem', width: '100%', height: '28px' }}
                          />
                        </Box>
                      )}

                      {/* Gator Signal */}
                      {deal.jay_ritter?.json_data?.analysis?.composite_score?.signal && (
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', color: '#6b7280', mb: 0.4, fontWeight: 700, textTransform: 'uppercase' }}>
                            Gator Signal
                          </Typography>
                          <Chip
                            label={deal.jay_ritter.json_data.analysis.composite_score.signal}
                            size="small"
                            color={getGatorSignalColor(deal.jay_ritter.json_data.analysis.composite_score.signal)}
                            sx={{ fontWeight: 800, fontSize: '0.75rem', width: '100%', height: '28px' }}
                          />
                        </Box>
                      )}

                      {/* Quant Signal */}
                      {deal.quant_agent?.quant_signal && (
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', color: '#6b7280', mb: 0.4, fontWeight: 700, textTransform: 'uppercase' }}>
                            Quant Signal
                          </Typography>
                          <Chip
                            label={deal.quant_agent.quant_signal}
                            size="small"
                            color={getQuantSignalColor(deal.quant_agent.quant_signal)}
                            sx={{ fontWeight: 800, fontSize: '0.75rem', width: '100%', height: '28px' }}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* Deal/Factors Agents */}
                    {((deal.ml_results &&
                      (deal.ml_results.t1d_pred || deal.ml_results.t1w_pred || deal.ml_results.t1m_pred)) ||
                      (volatilityOutlook &&
                        (volatilityOutlook['1-Week Sentiment'] || volatilityOutlook['1-Month Sentiment']))) && (
                      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #e5e7eb' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                          {/* Deal Agent */}
                          {volatilityOutlook && (volatilityOutlook['1-Week Sentiment'] || volatilityOutlook['1-Month Sentiment']) && (
                            <Box>
                              <Typography sx={{ fontSize: '0.7rem', color: '#6b7280', mb: 0.4, fontWeight: 700, textTransform: 'uppercase' }}>
                                Deal Agent
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {volatilityOutlook['1-Week Sentiment'] && (
                                  <Chip
                                    label={`1W: ${volatilityOutlook['1-Week Sentiment']}`}
                                    size="small"
                                    color={getSentimentColor(volatilityOutlook['1-Week Sentiment'])}
                                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                  />
                                )}
                                {volatilityOutlook['1-Month Sentiment'] && (
                                  <Chip
                                    label={`1M: ${volatilityOutlook['1-Month Sentiment']}`}
                                    size="small"
                                    color={getSentimentColor(volatilityOutlook['1-Month Sentiment'])}
                                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                  />
                                )}
                              </Box>
                            </Box>
                          )}

                          {/* Factors Agent */}
                          {deal.ml_results && (deal.ml_results.t1d_pred || deal.ml_results.t1w_pred || deal.ml_results.t1m_pred) && (
                            <Box>
                              <Typography sx={{ fontSize: '0.7rem', color: '#6b7280', mb: 0.4, fontWeight: 700, textTransform: 'uppercase' }}>
                                Factors Agent
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {deal.ml_results.t1d_pred && (
                                  <Chip
                                    label={`1D: ${deal.ml_results.t1d_pred}`}
                                    size="small"
                                    color={getPredictionColor(deal.ml_results.t1d_pred)}
                                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                  />
                                )}
                                {deal.ml_results.t1w_pred && (
                                  <Chip
                                    label={`1W: ${deal.ml_results.t1w_pred}`}
                                    size="small"
                                    color={getPredictionColor(deal.ml_results.t1w_pred)}
                                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                  />
                                )}
                                {deal.ml_results.t1m_pred && (
                                  <Chip
                                    label={`1M: ${deal.ml_results.t1m_pred}`}
                                    size="small"
                                    color={getPredictionColor(deal.ml_results.t1m_pred)}
                                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                  />
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Footer */}
                    <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 700 }}>
                        Click to view full analysis →
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 10,
            bgcolor: '#f9fafb',
            borderRadius: '14px',
            border: '1px solid #e5e7eb',
          }}
        >
          <Typography sx={{ color: '#6b7280', fontSize: '0.95rem', fontWeight: 500 }}>
            {searchTicker ? '🔍 No deals found matching your search' : '📭 No deals available'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SummarySignalBoardCardsList;
