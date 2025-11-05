import React, { useMemo } from 'react';
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
      {
        label: 'Share Price',
        value: formatCurrency(firstRecord.share_price, firstRecord.currency ?? 'USD'),
      },
      {
        label: 'Market Cap',
        value: formatNumber(firstRecord.market_cap),
      },
      {
        label: 'Enterprise Value',
        value: formatNumber(firstRecord.enterprise_value),
      },
      {
        label: 'Shares Outstanding',
        value: formatNumber(firstRecord.shares_outstanding, 3),
      },
      {
        label: 'Free Float %',
        value: formatNumber(firstRecord.free_float, 3),
      },
      {
        label: 'RSI (30d)',
        value: formatNumber(firstRecord.rsi_30d, 2),
      },
      {
        label: 'RSI (14d)',
        value: formatNumber(firstRecord.rsi_14d, 2),
      },
      {
        label: 'MACD (9d)',
        value: formatNumber(firstRecord.macd_9d, 3),
      },
      {
        label: '10 DMA',
        value: formatNumber(firstRecord['10dma'], 3),
      },
      {
        label: 'One-Day Performance %',
        value: formatNumber(firstRecord.one_day_performance, 3),
      },
      {
        label: 'VWAP',
        value: formatNumber(firstRecord.vwap, 3),
      },
      {
        label: '52 Week High',
        value: formatNumber(firstRecord['52_week_high']),
      },
      {
        label: '52 Week Low',
        value: formatNumber(firstRecord['52_week_low']),
      },
      {
        label: '20 Day Volatility',
        value: formatNumber(firstRecord['20_day_volatility'], 3),
      },
      {
        label: '3M Volatility',
        value: formatNumber(firstRecord['3m_volatility'], 3),
      },
      {
        label: 'Percent from 52W High',
        value: formatNumber(firstRecord.percent_from_52week_high, 3),
      },
    ];
  }, [firstRecord]);

  return (
    <section className="abb-section-card">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {highlights.length > 0 && (
        <div className="abb-section-chips">
          {highlights.map((highlight, index) => (
            <span className="abb-chip" key={`${index}-${highlight}`}>
              {highlight}
            </span>
          ))}
        </div>
      )}

      {loading && <span className="abb-info">Fetching FactSet technicals...</span>}
      {error && <span className="abb-error">{error}</span>}

      {!loading && !error && firstRecord && (
        <div className="abb-factset-grid">
          {metrics.map(({ label, value }) => (
            <div className="abb-factset-card" key={label}>
              <span className="abb-factset-label">{label}</span>
              <span className="abb-factset-value">{value}</span>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && !firstRecord && (
        <span className="abb-info">Request data to view FactSet technical metrics.</span>
      )}

      {firstRecord?.company_description && (
        <p className="abb-info">{firstRecord.company_description}</p>
      )}
    </section>
  );
};

export default ABBSection1;
