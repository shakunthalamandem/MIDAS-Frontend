import React, { useEffect, useState } from 'react';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import './MDTechnicalAnalysis.css';

interface DateOption {
  id: number;
  date: string;
  created_at: string;
  updated_at: string;
}

interface AnalysisItem {
  rsi: number | null;
  price: number;
  detail: string;
  ticker: string;
  trigger: string;
  deal_type: string;
}

interface PortfolioItem extends AnalysisItem {
  dma9: number | null;
  dma20: number | null;
  dma50: number | null;
  vol60: number | null;
  dma200: number | null;
  ticker: string;
  volume: number | null;
  avg_vol: number | null;
  dtd_pnl: number;
  target_price: number;
  ultimate_stop: number;
  triggers_fired: string[];
}

interface TechnicalAnalysisData {
  id: number;
  date: string;
  technical_analysis: {
    alerts: AnalysisItem[];
    warnings: AnalysisItem[];
    signals: AnalysisItem[];
    portfolio: PortfolioItem[];
    summary: {
      alerts_count: number;
      signals_count: number;
      warnings_count: number;
    };
  };
  created_at: string;
  updated_at: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const MDTechnicalAnalysis: React.FC = () => {
  const [dates, setDates] = useState<DateOption[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<TechnicalAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchDates = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/get_md_technical_analysis/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setDates(data);
      if (data.length > 0) {
        setSelectedDate(data[0].date);
      }
    } catch (error) {
      console.error('Error fetching dates:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAnalysis(selectedDate);
    }
  }, [selectedDate]);

  const fetchAnalysis = async (date: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/get_md_technical_analysis/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ date }),
      });
      const data = await response.json();
      setAnalysisData(data);
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className="md-technical-container">
      <Box className="report-header">
        <Box className="header-content">
          <Box>
            <h1 className="report-title">MIDAS Daily Technical Analysis Report</h1>
            {analysisData && (
              <Box className="header-meta">
                <span>Trade Date: {analysisData.date}</span>
                <span> | Indicators Date: {analysisData.date}</span>
                <span> | Generated: {new Date(analysisData.updated_at).toLocaleString()}</span>
              </Box>
            )}
          </Box>
          {/* Date Selector */}
          <Box className="date-selector-header">
            <label htmlFor="date-dropdown">Select Date:</label>
            <select
              id="date-dropdown"
              value={selectedDate || ''}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-dropdown"
            >
              {dates.map((d) => (
                <option key={d.id} value={d.date}>
                  {d.date}
                </option>
              ))}
            </select>
          </Box>
        </Box>
      </Box>

      {loading ? (
        <Box className="loading-container">
          <CircularProgress />
        </Box>
      ) : analysisData ? (
        <>
          {/* Technical Trigger Rules Reference - Collapsible */}
          <Box className="section rules-reference">
            <Box>
              <Box
                className="rules-header"
                onClick={() => setRulesExpanded(!rulesExpanded)}
              >
                <h2>Technical Trigger Rules Reference</h2>
                <span className={`expand-icon ${rulesExpanded ? 'expanded' : ''}`}>▼</span>
              </Box>
              <span className="expand-caption">
                {rulesExpanded ? 'collapse' : 'Expand for more details'}
              </span>
            </Box>
            {rulesExpanded && (
              <div className="rules-content">
                <div className="rule-category alert-category">
                  <h3>ALERTS (Critical — Action Needed)</h3>
                  <div className="rule-item">
                    <span className="rule-number">1. Price Near Stop</span>
                    <span className="rule-desc">Current price is within 0-5% above the ultimate stop loss. The stock is very close to hitting the stop.</span>
                  </div>
                  <div className="rule-item">
                    <span className="rule-number">2. Death Cross</span>
                    <span className="rule-desc">50-day MA is below 200-day MA, AND price is below 50-day MA. Short-term trend has crossed below long-term trend — classic bearish signal.</span>
                  </div>
                  <div className="rule-item">
                    <span className="rule-number">3. RSI Oversold</span>
                    <span className="rule-desc">RSI (14-day) is below 30. The stock has been selling too much and may bounce back or keep falling.</span>
                  </div>
                </div>

                <div className="rule-category warning-category">
                  <h3>WARNINGS (Caution)</h3>
                  <div className="rule-item">
                    <span className="rule-number">4. RSI Overbought</span>
                    <span className="rule-desc">RSI (14-day) is above 70. The stock has been bought too much and may pull back soon.</span>
                  </div>
                  <div className="rule-item">
                    <span className="rule-number">5. Bearish Momentum</span>
                    <span className="rule-desc">Price &lt; 9-day MA &lt; 20-day MA &lt; 50-day MA. All trending downward — stock is in a clear downtrend.</span>
                  </div>
                  <div className="rule-item">
                    <span className="rule-number">6. High Volatility</span>
                    <span className="rule-desc">60-day volatility is above 80%. The stock price is swinging wildly and is risky.</span>
                  </div>
                </div>

                <div className="rule-category signal-category">
                  <h3>SIGNALS (Positive)</h3>
                  <div className="rule-item">
                    <span className="rule-number">7. Bullish Momentum</span>
                    <span className="rule-desc">Price &gt; 9-day MA &gt; 20-day MA &gt; 50-day MA. All trending upward — stock is in a strong uptrend.</span>
                  </div>
                  <div className="rule-item">
                    <span className="rule-number">8. Golden Cross</span>
                    <span className="rule-desc">50-day MA is above 200-day MA, AND price is above 50-day MA. Short-term trend crossed above long-term trend — classic bullish signal.</span>
                  </div>
                  <div className="rule-item">
                    <span className="rule-number">9. Price Near Target</span>
                    <span className="rule-desc">Current price is within 0-5% below the target price. The stock is almost reaching its target.</span>
                  </div>
                  <div className="rule-item">
                    <span className="rule-number">10. Volume Spike</span>
                    <span className="rule-desc">Today's volume is more than 2x the 20-day average volume. Unusually high trading activity.</span>
                  </div>
                </div>

                <div className="alert-priority">
                  Alert Priority Order: Price Near Stop — Death Cross — RSI Oversold (most urgent first)
                </div>

                <div className="note-on-counts">
                  <h4>Note on Counts</h4>
                  <p>The Alert, Warning, and Signal counts represent the total number of triggers fired, not the total number of stocks. A single stock can trigger multiple rules at the same time (e.g., both High Volatility and Bullish Momentum). Some stocks may trigger zero rules. That is why the sum of Alerts + Warnings + Signals may not equal the total positions.</p>
                </div>
              </div>
            )}
          </Box>

          {/* Executive Summary */}
          <Box className="section executive-summary">
            <h2>Executive Summary</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Total Positions Analyzed:</span>
                <span className="summary-value">{analysisData.technical_analysis.portfolio.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label alert-text">Alerts (Critical):</span>
                <span className="summary-value alert-value">{analysisData.technical_analysis.summary.alerts_count}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label warning-text">Warnings:</span>
                <span className="summary-value warning-value">{analysisData.technical_analysis.summary.warnings_count}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label signal-text">Signals (Positive):</span>
                <span className="summary-value signal-value">{analysisData.technical_analysis.summary.signals_count}</span>
              </div>
            </div>
          </Box>

          {/* Alerts Section */}
          <TableSection
            title="ALERTS - Critical Triggers (Action Needed)"
            items={analysisData.technical_analysis.alerts}
            rowClass="alert-row"
          />

          {/* Warnings Section */}
          <TableSection
            title="WARNINGS - Caution Required"
            items={analysisData.technical_analysis.warnings}
            rowClass="warning-row"
          />

          {/* Signals Section */}
          <TableSection
            title="SIGNALS - Positive Indicators"
            items={analysisData.technical_analysis.signals}
            rowClass="signal-row"
          />

          {/* Full Portfolio Overview */}
          <PortfolioTable
            portfolio={analysisData.technical_analysis.portfolio}
          />

        </>
      ) : null}
    </Container>
  );
};

interface TableSectionProps {
  title: string;
  items: AnalysisItem[];
  rowClass: string;
}

const TableSection: React.FC<TableSectionProps> = ({ title, items, rowClass }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });

  const getSortedItems = () => {
    if (!sortConfig.key) return items;

    const sorted = [...items].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof AnalysisItem];
      const bVal = b[sortConfig.key as keyof AnalysisItem];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortConfig.direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    return sorted;
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    const isActive = sortConfig.key === columnKey;
    const icon = isActive ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ⇅';
    return <span className={`sort-icon ${isActive ? 'active' : ''}`}>{icon}</span>;
  };

  return (
    <Box className="section">
      <h2>{title}</h2>
      {items.length > 0 ? (
        <div className="table-wrapper">
          <table className="analysis-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('ticker')} className="sortable">
                  Ticker <SortIcon columnKey="ticker" />
                </th>
                <th onClick={() => handleSort('deal_type')} className="sortable">
                  Deal Type <SortIcon columnKey="deal_type" />
                </th>
                <th onClick={() => handleSort('price')} className="sortable">
                  Price <SortIcon columnKey="price" />
                </th>
                <th onClick={() => handleSort('rsi')} className="sortable">
                  RSI <SortIcon columnKey="rsi" />
                </th>
                <th onClick={() => handleSort('trigger')} className="sortable">
                  Trigger <SortIcon columnKey="trigger" />
                </th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {getSortedItems().map((item, idx) => (
                <tr key={idx} className={rowClass}>
                  <td className="ticker-cell">{item.ticker}</td>
                  <td>{item.deal_type}</td>
                  <td className="number-cell">{item.price.toFixed(2)}</td>
                  <td className="number-cell">{item.rsi !== null ? item.rsi.toFixed(2) : 'N/A'}</td>
                  <td className="trigger-cell">{item.trigger}</td>
                  <td className="details-cell">{item.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-data">No items to display</p>
      )}
    </Box>
  );
};

interface PortfolioTableProps {
  portfolio: PortfolioItem[];
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({ portfolio }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });

  const getSortedPortfolio = () => {
    if (!sortConfig.key) return portfolio;

    const sorted = [...portfolio].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof PortfolioItem];
      const bVal = b[sortConfig.key as keyof PortfolioItem];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortConfig.direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    return sorted;
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    const isActive = sortConfig.key === columnKey;
    const icon = isActive ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ⇅';
    return <span className={`sort-icon ${isActive ? 'active' : ''}`}>{icon}</span>;
  };

  return (
    <Box className="section portfolio-section">
      <h2>Full Portfolio Overview - ECM-US ({portfolio.length} Positions)</h2>
      <div className="table-wrapper">
        <table className="portfolio-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('ticker')} className="sortable">
                Ticker <SortIcon columnKey="ticker" />
              </th>
              <th onClick={() => handleSort('deal_type')} className="sortable">
                Deal Type <SortIcon columnKey="deal_type" />
              </th>
              <th onClick={() => handleSort('price')} className="sortable">
                Price <SortIcon columnKey="price" />
              </th>
              <th onClick={() => handleSort('dtd_pnl')} className="sortable">
                DTD P&L <SortIcon columnKey="dtd_pnl" />
              </th>
              <th onClick={() => handleSort('rsi')} className="sortable">
                RSI <SortIcon columnKey="rsi" />
              </th>
              <th onClick={() => handleSort('dma50')} className="sortable">
                DMA50 <SortIcon columnKey="dma50" />
              </th>
              <th onClick={() => handleSort('dma200')} className="sortable">
                DMA200 <SortIcon columnKey="dma200" />
              </th>
              <th onClick={() => handleSort('vol60')} className="sortable">
                Vol 60d <SortIcon columnKey="vol60" />
              </th>
              <th>Triggers</th>
            </tr>
          </thead>
          <tbody>
            {getSortedPortfolio().map((item, idx) => (
              <tr key={idx}>
                <td className="ticker-cell">{item.ticker}</td>
                <td>{item.deal_type}</td>
                <td className="number-cell">{item.price.toFixed(2)}</td>
                <td className={`number-cell ${item.dtd_pnl >= 0 ? 'positive' : 'negative'}`}>
                  {item.dtd_pnl >= 0 ? '+' : ''}{item.dtd_pnl.toFixed(2)}
                </td>
                <td className="number-cell">{item.rsi !== null ? item.rsi.toFixed(2) : 'N/A'}</td>
                <td className="number-cell">{item.dma50 !== null ? item.dma50.toFixed(2) : 'N/A'}</td>
                <td className="number-cell">{item.dma200 !== null ? item.dma200.toFixed(2) : 'N/A'}</td>
                <td className="number-cell">{item.vol60 !== null ? item.vol60.toFixed(2) : 'N/A'}</td>
                <td className="triggers-cell">
                  {item.triggers_fired.length > 0 ? item.triggers_fired.join(', ') : 'None'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Box>
  );
};

export default MDTechnicalAnalysis;
