import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { CardType, DealData } from './types';
import {
  getSentimentColor,
  getPredictionColor,
  getQuantSignalColor,
  getGatorSignalColor,
  parseVolatilityOutlook,
  getPricingDate,
} from './utils';

interface SummarySignalBoardTableProps {
  selectedCard: CardType;
  selectedData: DealData[];
  onClose: () => void;
  searchTicker: string;
  onSearchChange: (value: string) => void;
  dealTypeFilter: "IPO" | "FO";
}

const SummarySignalBoardTable: React.FC<SummarySignalBoardTableProps> = ({
  selectedCard,
  selectedData,
  onClose,
  searchTicker,
  onSearchChange,
  dealTypeFilter,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [sortColumn, setSortColumn] = useState<string>('trade_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isTableExpanded, setIsTableExpanded] = useState(true);

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

      if (sortColumn === 'trade_date') {
        aValue = a.unsupervised_summary?.trade_date || a.trade_date || '';
        bValue = b.unsupervised_summary?.trade_date || b.trade_date || '';
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
        aValue = a.jay_ritter?.json_data?.analysis?.composite_score?.signal || '';
        bValue = b.jay_ritter?.json_data?.analysis?.composite_score?.signal || '';
      }

      if (sortColumn === 'quant_signal') {
        aValue = a.quant_agent?.quant_signal || '';
        bValue = b.quant_agent?.quant_signal || '';
      }

      if (sortColumn === 'technical_agent') {
        aValue = a.technical_data?.triggers_fired?.[0] || '';
        bValue = b.technical_data?.triggers_fired?.[0] || '';
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

  const toggleTableExpand = () => {
    setIsTableExpanded(!isTableExpanded);
  };

  const getTechnicalTriggerSeverity = (trigger: string): 'alert' | 'warning' | 'signal' | 'neutral' => {
    const lowerTrigger = trigger.toLowerCase();

    const alerts = ['price near stop', 'death cross', 'rsi oversold'];
    if (alerts.some(alert => lowerTrigger.includes(alert))) return 'alert';

    const warnings = ['rsi overbought', 'bearish momentum', 'high volatility'];
    if (warnings.some(warning => lowerTrigger.includes(warning))) return 'warning';

    const signals = ['bullish momentum', 'golden cross', 'price near target', 'volume spike'];
    if (signals.some(signal => lowerTrigger.includes(signal))) return 'signal';

    return 'neutral';
  };

  const getTriggerSeverityStyle = (severity: 'alert' | 'warning' | 'signal' | 'neutral') => {
    switch (severity) {
      case 'alert':
        return { bg: '#ed6c02', text: '#ffffff', border: '#ed6c02', label: 'Critical Alert' };
      case 'warning':
        return { bg: '#d32f2f', text: '#ffffff', border: '#d32f2f', label: 'Warning' };
      case 'signal':
        return { bg: '#2e7d32', text: '#ffffff', border: '#2e7d32', label: 'Positive Signal' };
      default:
        return { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB', label: 'Neutral' };
    }
  };

  const handleTickerClick = (deal: DealData) => {
    const ticker = deal.ticker;

    // Try multiple possible property names for unique ID
    const uniqueId =
      (deal as any).unique_deal_id ||
      (deal as any).unique_id ||
      (deal as any).id ||
      (deal as any).deal_id ||
      ticker;

    console.log('Deal object properties:', Object.keys(deal));
    console.log('Unique ID for navigation:', uniqueId);

    // Navigate to agents page with ticker and deal ID
    const url = `/agents/ticker/${encodeURIComponent(ticker)}?uniqueId=${encodeURIComponent(String(uniqueId))}`;
    window.open(url, '_blank');
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
    <Box sx={{ mt: 6 }}>

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
          <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow
                sx={{
                  '& .MuiTableCell-head': {
                    backgroundColor: '#1a237e !important',
                    color: 'white !important',
                    fontWeight: 700,
                    mt:4,
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    padding: '12px 8px',
                    wordWrap: 'break-word',
                    whiteSpace: 'normal',
                    overflowWrap: 'break-word',
                  },
                  '& .MuiTableSortLabel-root': {
                    color: 'white !important',
                  },
                  '& .MuiTableSortLabel-icon': {
                    color: 'white !important',
                  },
                }}
              >
                <TableCell sx={{ width: '12%' }} sortDirection={sortColumn === 'ticker' ? sortDirection : false}>
                  <TableSortLabel
                    active={sortColumn === 'ticker'}
                    direction={sortColumn === 'ticker' ? sortDirection : 'asc'}
                    onClick={() => handleSort('ticker')}
                  >
                    Ticker
                  </TableSortLabel>
                </TableCell>

                {selectedCard === 'portfolio' && (
                  <TableCell sx={{ width: '12%' }} sortDirection={sortColumn === 'trade_date' ? sortDirection : false}>
                    <TableSortLabel
                      active={sortColumn === 'trade_date'}
                      direction={sortColumn === 'trade_date' ? sortDirection : 'asc'}
                      onClick={() => handleSort('trade_date')}
                    >
                      First Trade Date
                    </TableSortLabel>
                  </TableCell>
                )}

                {selectedCard === 'recent' && (
                  <TableCell sx={{ width: '12%' }} sortDirection={sortColumn === 'trade_date' ? sortDirection : false}>
                    <TableSortLabel
                      active={sortColumn === 'trade_date'}
                      direction={sortColumn === 'trade_date' ? sortDirection : 'asc'}
                      onClick={() => handleSort('trade_date')}
                    >
                      First Trade Date
                    </TableSortLabel>
                  </TableCell>
                )}

                <TableCell sx={{ width: '14%' }} sortDirection={sortColumn === 'sentiment_score' ? sortDirection : false}>
                  <TableSortLabel
                    active={sortColumn === 'sentiment_score'}
                    direction={sortColumn === 'sentiment_score' ? sortDirection : 'asc'}
                    onClick={() => handleSort('sentiment_score')}
                  >
                    Sentiment Agent
                  </TableSortLabel>
                </TableCell>

                {dealTypeFilter === 'IPO' && (
                  <TableCell sx={{ width: '14%' }} sortDirection={sortColumn === 'gator_signal' ? sortDirection : false}>
                    <TableSortLabel
                      active={sortColumn === 'gator_signal'}
                      direction={sortColumn === 'gator_signal' ? sortDirection : 'asc'}
                      onClick={() => handleSort('gator_signal')}
                    >
                      {selectedCard === 'upcoming' ? 'Gator Signal' : 'Gator Post Signal'}
                    </TableSortLabel>
                  </TableCell>
                )}
                
                {(selectedCard === 'portfolio' || selectedCard === 'recent') && (
                  <TableCell sx={{ width: '14%' }} sortDirection={sortColumn === 'quant_signal' ? sortDirection : false}>
                    <TableSortLabel
                      active={sortColumn === 'quant_signal'}
                      direction={sortColumn === 'quant_signal' ? sortDirection : 'asc'}
                      onClick={() => handleSort('quant_signal')}
                    >
                      Quant Agent
                    </TableSortLabel>
                  </TableCell>
                )}

                {selectedCard === 'portfolio' && (
                  <TableCell sx={{ width: '16%' }} sortDirection={sortColumn === 'technical_agent' ? sortDirection : false}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <TableSortLabel
                        active={sortColumn === 'technical_agent'}
                        direction={sortColumn === 'technical_agent' ? sortDirection : 'asc'}
                        onClick={() => handleSort('technical_agent')}
                      >
                        Technical Agent
                      </TableSortLabel>
                      <IconButton
                        size="small"
                        onClick={toggleTableExpand}
                        sx={{
                          transform: isTableExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
                          transition: 'transform 0.3s',
                        }}
                      >
                        <ChevronLeftIcon sx={{ fontSize: '1.5rem', color: 'white' }} />
                      </IconButton>
                    </Box>
                  </TableCell>
                )}

                {(selectedCard !== 'portfolio' || isTableExpanded) && (
                  <>
                    {dealTypeFilter === 'IPO' && (
                      <TableCell sx={{ width: '16%' }} sortDirection={sortColumn === 'deal_agent' ? sortDirection : false}>
                        <TableSortLabel
                          active={sortColumn === 'deal_agent'}
                          direction={sortColumn === 'deal_agent' ? sortDirection : 'asc'}
                          onClick={() => handleSort('deal_agent')}
                        >
                          Deal (IPO) Agent
                        </TableSortLabel>
                      </TableCell>
                    )}

                    <TableCell sx={{ width: '16%' }} sortDirection={sortColumn === 'factors_agent' ? sortDirection : false}>
                      <TableSortLabel
                        active={sortColumn === 'factors_agent'}
                        direction={sortColumn === 'factors_agent' ? sortDirection : 'asc'}
                        onClick={() => handleSort('factors_agent')}
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

                return (
                  <React.Fragment key={index}>
                    <TableRow
                      sx={{
                        backgroundColor: index % 2 === 0 ? '#fff' : '#fcfcfc',
                        '&:hover': {
                          bgcolor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <TableCell
                        sx={{ width: '12%', fontWeight: 700, fontSize: '1rem', color: '#273faa', cursor: 'pointer', wordWrap: 'break-word', overflowWrap: 'break-word', '&:hover': { textDecoration: 'underline' } }}
                        onClick={() => handleTickerClick(deal)}
                      >
                        {deal.ticker}
                      </TableCell>

                      {(selectedCard === 'portfolio' || selectedCard === 'recent') && (
                        <TableCell sx={{ width: '12%', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                          {deal.unsupervised_summary?.trade_date || deal.trade_date || 'None'}
                        </TableCell>
                      )}

                      {/* Sentiment Agent Column */}
                      <TableCell sx={{ width: '14%', wordWrap: 'break-word', overflowWrap: 'break-word', padding: '8px' }}>
                        {((deal.sentiment?.socialmedia_retail_sentiment_score !== undefined &&
                          deal.sentiment?.socialmedia_retail_sentiment_score !== null) ||
                          (deal.sentiment_summary?.socialmedia_retail_sentiment_score !== undefined &&
                            deal.sentiment_summary?.socialmedia_retail_sentiment_score !== null) ||
                          (typeof deal.sentiment?.sentiment_summary === 'object' &&
                            deal.sentiment.sentiment_summary?.socialmedia_retail_sentiment_score !== undefined &&
                            deal.sentiment.sentiment_summary?.socialmedia_retail_sentiment_score !== null) ||
                          deal.sentiment?.one_week_sentiment ||
                          deal.sentiment_summary?.one_week_sentiment ||
                          deal.sentiment?.one_month_sentiment ||
                          deal.sentiment_summary?.one_month_sentiment) ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                            {((deal.sentiment?.socialmedia_retail_sentiment_score !== undefined &&
                              deal.sentiment?.socialmedia_retail_sentiment_score !== null) ||
                              (deal.sentiment_summary?.socialmedia_retail_sentiment_score !== undefined &&
                                deal.sentiment_summary?.socialmedia_retail_sentiment_score !== null) ||
                              (typeof deal.sentiment?.sentiment_summary === 'object' &&
                                deal.sentiment.sentiment_summary?.socialmedia_retail_sentiment_score !== undefined &&
                                deal.sentiment.sentiment_summary?.socialmedia_retail_sentiment_score !== null)) && (
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 600, color: '#1a237e', fontSize: '0.75rem' }}
                              >
                                Score:{' '}
                                {deal.sentiment?.socialmedia_retail_sentiment_score !== undefined &&
                                deal.sentiment?.socialmedia_retail_sentiment_score !== null
                                  ? `${deal.sentiment.socialmedia_retail_sentiment_score}/100`
                                  : deal.sentiment_summary?.socialmedia_retail_sentiment_score !== undefined &&
                                    deal.sentiment_summary?.socialmedia_retail_sentiment_score !== null
                                  ? `${deal.sentiment_summary.socialmedia_retail_sentiment_score}/100`
                                  : typeof deal.sentiment?.sentiment_summary === 'object' &&
                                    deal.sentiment.sentiment_summary?.socialmedia_retail_sentiment_score !== undefined &&
                                    deal.sentiment.sentiment_summary?.socialmedia_retail_sentiment_score !== null
                                  ? `${deal.sentiment.sentiment_summary.socialmedia_retail_sentiment_score}/100`
                                  : null}
                              </Typography>
                            )}
                            {(deal.sentiment?.one_week_sentiment ||
                              deal.sentiment_summary?.one_week_sentiment) && (
                                <Chip
                                  label={`1W: ${deal.sentiment?.one_week_sentiment ||
                                    deal.sentiment_summary?.one_week_sentiment
                                    }`}
                                  size="small"
                                  color={getSentimentColor(
                                    deal.sentiment?.one_week_sentiment ||
                                    deal.sentiment_summary?.one_week_sentiment
                                  )}
                                  sx={{ maxWidth: 'fit-content', fontWeight: 600, fontSize: '0.75rem' }}
                                />
                              )}
                            {(deal.sentiment?.one_month_sentiment ||
                              deal.sentiment_summary?.one_month_sentiment) && (
                                <Chip
                                  label={`1M: ${deal.sentiment?.one_month_sentiment ||
                                    deal.sentiment_summary?.one_month_sentiment
                                    }`}
                                  size="small"
                                  color={getSentimentColor(
                                    deal.sentiment?.one_month_sentiment ||
                                    deal.sentiment_summary?.one_month_sentiment
                                  )}
                                  sx={{ maxWidth: 'fit-content', fontWeight: 600, fontSize: '0.75rem' }}
                                />
                              )}
                            {(deal.sentiment?.last_run || deal.sentiment_summary?.last_run) && (
                              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#999', marginTop: '4px' }}>
                                Updated: {new Date(deal.sentiment?.last_run || deal.sentiment_summary?.last_run).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            None
                          </Typography>
                        )}
                      </TableCell>

                      {/* Gator Signal Column */}
                      {dealTypeFilter === 'IPO' && (
                        <TableCell sx={{ width: '14%', wordWrap: 'break-word', overflowWrap: 'break-word', padding: '8px' }}>
                          {(selectedCard === 'portfolio' || selectedCard === 'recent') ? (
                            deal.gator_post_ipo?.gatorpost_signal ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem', fontWeight: 600 }}>
                                  Post-IPO
                                </Typography>
                                <Chip
                                  label={deal.gator_post_ipo.gatorpost_signal}
                                  size="small"
                                  color={getGatorSignalColor(deal.gator_post_ipo.gatorpost_signal)}
                                  sx={{ maxWidth: 'fit-content', fontWeight: 600, fontSize: '0.75rem' }}
                                />
                                {deal.gator_post_ipo?.updated_at && (
                                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#999', marginTop: '4px' }}>
                                    Updated: {new Date(deal.gator_post_ipo.updated_at).toLocaleDateString()}
                                  </Typography>
                                )}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                None
                              </Typography>
                            )
                          ) : deal.jay_ritter?.json_data?.analysis?.composite_score?.signal ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                              <Chip
                                label={deal.jay_ritter.json_data.analysis.composite_score.signal}
                                size="small"
                                color={getGatorSignalColor(deal.jay_ritter.json_data.analysis.composite_score.signal)}
                                sx={{ maxWidth: 'fit-content', fontWeight: 600, fontSize: '0.75rem' }}
                              />
                              <Typography variant="caption" sx={{ color: '#000', wordBreak: 'break-word', fontSize: '0.75rem' }}>
                                Score: {deal.jay_ritter.json_data.analysis.composite_score.score}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                                Grade: {deal.jay_ritter.json_data.analysis.composite_score.grade}
                              </Typography>
                              {deal.jay_ritter?.updated_at && (
                                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#999', marginTop: '4px' }}>
                                  Updated: {new Date(deal.jay_ritter.updated_at).toLocaleDateString()}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              None
                            </Typography>
                          )}
                        </TableCell>
                      )}

                      {/* Quant Signal Column */}
                      {(selectedCard === 'portfolio' || selectedCard === 'recent') && (
                        <TableCell sx={{ width: '14%', wordWrap: 'break-word', overflowWrap: 'break-word', padding: '8px' }}>
                          {deal.quant_agent?.quant_signal ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                              <Chip
                                label={deal.quant_agent.quant_signal}
                                size="small"
                                color={getQuantSignalColor(deal.quant_agent.quant_signal)}
                                sx={{ maxWidth: 'fit-content', fontWeight: 600, fontSize: '0.75rem' }}
                              />
                              {deal.quant_agent?.run_date && (
                                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#777777', marginTop: '4px' }}>
                                  Updated: {new Date(deal.quant_agent.run_date).toLocaleDateString()}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              None
                            </Typography>
                          )}
                        </TableCell>
                      )}

                      {/* Technical Agent Column */}
                      {selectedCard === 'portfolio' && (
                        <TableCell sx={{ width: '16%', wordWrap: 'break-word', overflowWrap: 'break-word', padding: '8px' }}>
                          {deal.technical_data?.triggers_fired && deal.technical_data.triggers_fired.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                              {deal.technical_data.triggers_fired.map((trigger: string, idx: number) => {
                                const severity = getTechnicalTriggerSeverity(trigger);
                                const style = getTriggerSeverityStyle(severity);
                                return (
                                  <Chip
                                    key={idx}
                                    label={trigger}
                                    size="small"
                                    sx={{
                                      maxWidth: 'fit-content',
                                      fontWeight: 600,
                                      fontSize: '0.75rem',
                                      backgroundColor: style.bg,
                                      color: style.text,
                                      border: `1px solid ${style.border}`,
                                    }}
                                  />
                                );
                              })}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              None
                            </Typography>
                          )}
                        </TableCell>
                      )}

                      {/* Deal (IPO) Agent Column - Shown when Expanded or for non-portfolio tables */}
                      {(selectedCard !== 'portfolio' || isTableExpanded) && dealTypeFilter === 'IPO' && (
                        <TableCell sx={{ width: '16%', wordWrap: 'break-word', overflowWrap: 'break-word', padding: '8px' }}>
                          {volatilityOutlook ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                              {volatilityOutlook['1-Week Sentiment'] && (
                                <Chip
                                  label={`1W: ${volatilityOutlook['1-Week Sentiment']}`}
                                  size="small"
                                  color={getSentimentColor(
                                    volatilityOutlook['1-Week Sentiment']
                                  )}
                                  sx={{ maxWidth: 'fit-content', fontWeight: 600, fontSize: '0.75rem' }}
                                />
                              )}
                              {volatilityOutlook['1-Month Sentiment'] && (
                                <Chip
                                  label={`1M: ${volatilityOutlook['1-Month Sentiment']}`}
                                  size="small"
                                  color={getSentimentColor(
                                    volatilityOutlook['1-Month Sentiment']
                                  )}
                                  sx={{ maxWidth: 'fit-content', fontWeight: 600, fontSize: '0.75rem' }}
                                />
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              None
                            </Typography>
                          )}
                        </TableCell>
                      )}

                      {/* Factors Based Agent Column - Shown when Expanded or for non-portfolio tables */}
                      {(selectedCard !== 'portfolio' || isTableExpanded) && (
                        <TableCell sx={{ width: '16%', wordWrap: 'break-word', overflowWrap: 'break-word', padding: '8px' }}>
                          {deal.ml_results &&
                            (deal.ml_results.t1d_pred || deal.ml_results.t1w_pred || deal.ml_results.t1m_pred) ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                              {deal.ml_results.t1d_pred && (
                                <Chip
                                  label={`1D: ${deal.ml_results.t1d_pred}`}
                                  size="small"
                                  color={getPredictionColor(deal.ml_results.t1d_pred)}
                                  sx={{ maxWidth: 'fit-content', fontWeight: 600, fontSize: '0.75rem' }}
                                />
                              )}
                              {deal.ml_results.t1w_pred && (
                                <Chip
                                  label={`1W: ${deal.ml_results.t1w_pred}`}
                                  size="small"
                                  color={getPredictionColor(deal.ml_results.t1w_pred)}
                                  sx={{ maxWidth: 'fit-content', fontWeight: 600, fontSize: '0.75rem' }}
                                />
                              )}
                              {deal.ml_results.t1m_pred && (
                                <Chip
                                  label={`1M: ${deal.ml_results.t1m_pred}`}
                                  size="small"
                                  color={getPredictionColor(deal.ml_results.t1m_pred)}
                                  sx={{ maxWidth: 'fit-content', fontWeight: 600, fontSize: '0.75rem' }}
                                />
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              None
                            </Typography>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  </React.Fragment>
                );
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
