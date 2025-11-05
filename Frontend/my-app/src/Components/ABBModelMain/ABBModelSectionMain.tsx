import React, { FormEvent, useCallback, useState } from 'react';
import ABBSection1 from './ABBSection1';
import ABBSection2 from './ABBSection2';
import ABBSection3 from './ABBSection3';
import ABBSection4 from './ABBSection4';
import ABBSection5 from './ABBSection5';
import ABBSection6 from './ABBSection6';
import ABBSection7 from './ABBSection7';
import ABBSection8 from './ABBSection8';
import type { ABBFactsetResponse, ABBSectionProps } from './ABBSection.types';
import './ABBModelSectionMain.css';

const sectionData: ABBSectionProps[] = [
  {
    title: 'Executive Summary',
    description: 'High-level overview of the ABB model insights and business outcomes.',
    highlights: ['Key objectives', 'Top-line metrics', 'Strategic priorities'],
  },
  {
    title: 'Financial Metrics',
    description: 'Detailed breakdown of revenue, cost, and profitability drivers.',
    highlights: ['Revenue trends', 'Cost optimization levers', 'EBITDA impact'],
  },
  {
    title: 'Operational Insights',
    description: 'Operational performance indicators and process efficiency insights.',
    highlights: ['Throughput analysis', 'Cycle-time improvements', 'Resource utilization'],
  },
  {
    title: 'Customer Segmentation',
    description: 'Segmentation of customers with tailored engagement strategies.',
    highlights: ['Segment definitions', 'Value propositions', 'Engagement tactics'],
  },
  {
    title: 'Product Performance',
    description: 'Assessment of product portfolio performance and opportunities.',
    highlights: ['Top-performing products', 'Underperforming SKUs', 'Innovation pipeline'],
  },
  {
    title: 'Risk Assessment',
    description: 'Identified risks and mitigation plans associated with the ABB model.',
    highlights: ['Operational risks', 'Financial risks', 'Mitigation strategies'],
  },
  {
    title: 'Implementation Roadmap',
    description: 'Step-by-step plan to operationalize ABB model recommendations.',
    highlights: ['Phase timelines', 'Resource allocation', 'Success metrics'],
  },
  {
    title: 'Appendix & Resources',
    description: 'Supporting documents, data sources, and contact points.',
    highlights: ['Reference materials', 'Data dictionaries', 'Support contacts'],
  },
];

const ABBModelSectionMain: React.FC = () => {
  const [ticker, setTicker] = useState<string>('AAPL-US');
  const [tradeDate, setTradeDate] = useState<string>('');
  const [factsetData, setFactsetData] = useState<ABBFactsetResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      if (!ticker.trim()) {
        setError('Ticker is required.');
        return;
      }
      if (!tradeDate) {
        setError('Trade date is required.');
        return;
      }

      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        setError('Missing API configuration.');
        return;
      }

      const token = localStorage.getItem('access_token');
      const payload = {
        ticker: ticker.trim(),
        trade_date: tradeDate,
      };

      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/api/abb_factset_data/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(payload),
        });

        const json = await response.json();

        if (!response.ok) {
          const detail = json?.error || json?.detail || 'Unable to fetch FactSet data.';
          setError(typeof detail === 'string' ? detail : 'Unable to fetch FactSet data.');
          setFactsetData(null);
          return;
        }

        setFactsetData(json as ABBFactsetResponse);
      } catch (fetchError) {
        setError('Unexpected error while fetching FactSet data.');
        setFactsetData(null);
      } finally {
        setLoading(false);
      }
    },
    [ticker, tradeDate],
  );

  return (
    <div className="abb-model-section">
      <div className="abb-form-card">
        <form className="abb-form" onSubmit={handleSubmit}>
          <label htmlFor="abb-ticker">
            Ticker
            <input
              id="abb-ticker"
              name="ticker"
              type="text"
              placeholder="e.g. AAPL-US"
              value={ticker}
              onChange={(event) => setTicker(event.target.value)}
            />
          </label>

          <label htmlFor="abb-trade-date">
            Trade Date
            <input
              id="abb-trade-date"
              name="tradeDate"
              type="date"
              value={tradeDate}
              onChange={(event) => setTradeDate(event.target.value)}
            />
          </label>

          <button className="abb-submit" type="submit" disabled={loading}>
            {loading ? 'Fetching...' : 'Get Data'}
          </button>
        </form>
      </div>

      <ABBSection1
        {...sectionData[0]}
        factsetData={factsetData}
        loading={loading}
        error={error}
      />
      <ABBSection2 {...sectionData[1]} />
      <ABBSection3 {...sectionData[2]} />
      <ABBSection4 {...sectionData[3]} />
      <ABBSection5 {...sectionData[4]} />
      <ABBSection6 {...sectionData[5]} />
      <ABBSection7 {...sectionData[6]} />
      <ABBSection8 {...sectionData[7]} />
    </div>
  );
};

export default ABBModelSectionMain;
