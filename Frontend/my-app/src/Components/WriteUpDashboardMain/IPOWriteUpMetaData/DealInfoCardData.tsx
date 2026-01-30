import React from 'react';

interface WriteUpData {
  ticker_name: string;
  exchange: string;
  company_name: string;
  pricing_date: string;
  deal_size: number;
  industry: string;
  shares_offered: number;
  nosh: number;
  established_year: number;
  lower_bound: number;
  upper_bound: number;
  filed_date: string;
  term_date: string;
  trade_date: string;
  bookrunners: string[];
}

interface DealInfoCardDataProps {
  writeUpData: WriteUpData;
}

const DealInfoCardData: React.FC<DealInfoCardDataProps> = ({ writeUpData }) => {
  // Format the dates (you can adjust the format as per your needs)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  return (
    <div className="deal-info-card">
      <h2 className="deal-info-title">{writeUpData.company_name} - {writeUpData.ticker_name}</h2>
      
      <div className="timeline">
        <div className="timeline-event">
          <h4>Filed Date</h4>
          <p>{formatDate(writeUpData.filed_date)}</p>
        </div>
        <div className="timeline-event">
          <h4>Pricing Range Date</h4>
          <p>{formatDate(writeUpData.term_date)}</p>
        </div>
        <div className="timeline-event">
          <h4>Pricing Date</h4>
          <p>{formatDate(writeUpData.pricing_date)}</p>
        </div>
        <div className="timeline-event">
          <h4>First Trade Date</h4>
          <p>{formatDate(writeUpData.trade_date)}</p>
        </div>
      </div>

      <div className="deal-details">
        <div>
          <strong>Exchange:</strong> {writeUpData.exchange}
        </div>
        <div>
          <strong>Deal Size:</strong> ${writeUpData.deal_size.toLocaleString()}
        </div>
        <div>
          <strong>Industry:</strong> {writeUpData.industry}
        </div>
        <div>
          <strong>Shares Offered:</strong> {writeUpData.shares_offered.toLocaleString()}
        </div>
        <div>
          <strong>Bookrunners:</strong> {writeUpData.bookrunners.join(', ')}
        </div>
      </div>
    </div>
  );
};

export default DealInfoCardData;
