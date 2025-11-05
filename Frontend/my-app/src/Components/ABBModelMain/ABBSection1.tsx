import React, { useMemo } from 'react';
import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { ABBSectionProps } from './ABBSection.types';

const formatNumber = (value: number | null, digits = 2): string => {
  if (value === null || Number.isNaN(value)) {
    return 'N/A';
  }

  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
};

const formatLargeNumber = (value: number | null, digits = 2): string => {
  if (value === null || Number.isNaN(value)) {
    return 'N/A';
  }

  return value.toLocaleString(undefined, {
    notation: 'compact',
    maximumFractionDigits: digits,
  });
};

const formatCurrency = (value: number | null, currency = 'USD'): string => {
  if (value === null || Number.isNaN(value)) {
    return 'N/A';
  }

  return value.toLocaleString(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  });
};

const formatPercent = (value: number | null, digits = 2): string => {
  if (value === null || Number.isNaN(value)) {
    return 'N/A';
  }
  return `${formatNumber(value, digits)}%`;
};

const formatText = (value: string | null | undefined): string => value?.trim() || 'N/A';

const ABBSection1: React.FC<ABBSectionProps> = ({
  title,
  description,
  highlights = [],
  factsetData,
  loading = false,
  error = null,
}) => {
  const firstRecord = factsetData?.data?.[0] ?? null;

  const metrics = useMemo(() => {
    if (!firstRecord) {
      return [];
    }

    return [
      { label: 'Ticker', value: formatText(factsetData?.ticker) },
      { label: 'Trade Date', value: formatText(factsetData?.trade_date) },
      { label: 'Reported Date', value: formatText(firstRecord.date) },
      { label: 'Request ID', value: formatText(firstRecord.requestId) },
      {
        label: 'Share Price',
        value: formatCurrency(firstRecord.share_price, firstRecord.currency ?? 'USD'),
      },
      { label: 'Currency', value: formatText(firstRecord.currency) },
      { label: 'Default Currency', value: formatText(firstRecord.default_currency) },
      { label: 'Market Cap', value: formatLargeNumber(firstRecord.market_cap) },
      { label: 'Enterprise Value', value: formatLargeNumber(firstRecord.enterprise_value) },
      {
        label: 'Shares Outstanding',
        value: formatLargeNumber(firstRecord.shares_outstanding, 3),
      },
      {
        label: 'Percent Free Float',
        value: formatPercent(firstRecord.percent_free_float, 2),
      },
      { label: 'Free Float', value: formatPercent(firstRecord.free_float, 2) },
      {
        label: 'Institutional Percentage',
        value: formatPercent(firstRecord.institutional_percentage, 2),
      },
      { label: 'VWAP', value: formatNumber(firstRecord.vwap, 3) },
      {
        label: '3M ADTV (Shares)',
        value: formatLargeNumber(firstRecord.three_m_adtv_shares, 3),
      },
      {
        label: '3M ADTV (Local Value)',
        value: formatLargeNumber(firstRecord.three_m_adtv_local_value, 3),
      },
      { label: '52 Week High', value: formatNumber(firstRecord['52_week_high'], 2) },
      { label: '52 Week Low', value: formatNumber(firstRecord['52_week_low'], 2) },
      {
        label: 'Percent from 52W High',
        value: formatPercent(firstRecord.percent_from_52week_high, 2),
      },
      { label: 'RSI (30d)', value: formatNumber(firstRecord.rsi_30d, 2) },
      { label: 'RSI (14d)', value: formatNumber(firstRecord.rsi_14d, 2) },
      { label: 'MACD (9d)', value: formatNumber(firstRecord.macd_9d, 3) },
      { label: '10 DMA', value: formatNumber(firstRecord['10dma'], 3) },
      {
        label: 'One-Day Performance',
        value: formatPercent(firstRecord.one_day_performance, 2),
      },
      { label: 'FCF Yield (LTM)', value: formatPercent(firstRecord.fcf_yield_ltm, 2) },
      {
        label: 'FCF Dividend Yield',
        value: formatPercent(firstRecord.fcf_dividend_yield, 2),
      },
      { label: '20 Day Volatility', value: formatPercent(firstRecord['20_day_volatility'], 2) },
      { label: '30 Day Volatility', value: formatPercent(firstRecord['30_day_volatility'], 2) },
      { label: '60 Day Volatility', value: formatPercent(firstRecord['60_day_volatility'], 2) },
      { label: '3M Volatility', value: formatPercent(firstRecord['3m_volatility'], 2) },
      { label: 'Beta Benchmark', value: formatNumber(firstRecord.beta_benchmark, 3) },
      { label: 'Benchmark', value: formatText(firstRecord.benchmark) },
      { label: 'Benchmark Name', value: formatText(firstRecord.benchmark_name) },
    ];
  }, [factsetData?.ticker, factsetData?.trade_date, firstRecord]);

  return (
    <Card className="abb-section-card">
      <CardContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: '#142b6f' }}>
              {title}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(15,35,95,0.72)', mt: 1 }}>
              {description}
            </Typography>
          </Box>

          {highlights.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={1}>
              {highlights.map((highlight, index) => (
                <Chip key={`${index}-${highlight}`} label={highlight} className="abb-chip" />
              ))}
            </Box>
          )}

          {loading && <Typography className="abb-info">Fetching FactSet technicals...</Typography>}

          {!loading && error && <Typography className="abb-error">{error}</Typography>}

          {!loading && !error && firstRecord && (
            <Box className="abb-factset-grid">
              {metrics.map(({ label, value }) => (
                <Box className="abb-factset-card" key={label}>
                  <Typography className="abb-factset-label">{label}</Typography>
                  <Typography className="abb-factset-value">{value}</Typography>
                </Box>
              ))}
            </Box>
          )}

          {!loading && !error && !firstRecord && (
            <Typography className="abb-info">
              Request data to view FactSet technical metrics.
            </Typography>
          )}

          {firstRecord?.company_description && (
            <Typography className="abb-info" sx={{ mt: 1.5 }}>
              {firstRecord.company_description}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ABBSection1;
