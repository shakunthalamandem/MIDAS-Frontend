import React from 'react';
import FOBusinessHighlights from '../FOWriteSections/FOBusinessHighlights';
import FOComparisionTableMain from '../FOWriteSections/FOComparisionTableMain';
import FODealInformation from '../FOWriteSections/FODealInformation';
import FOFinancialHighlights from '../FOWriteSections/FOFinancialHighlights';
import FOFutureOutlook from '../FOWriteSections/FOFutureOutlook';
import FOManagementWriteUp from '../FOWriteSections/FOManagementWriteUp';
import FORecentNews from '../FOWriteSections/FORecentNews';
import FOSharePricePerfomance from '../FOWriteSections/FOSharePricePerfomance';
import FOStrengthWriteUp from '../FOWriteSections/FOStrengthWriteUp';
import FOTradingDetails from '../FOWriteSections/FOTradingDetails';
import FOValuationWriteup from '../FOWriteSections/FOValuationWriteup';



interface FOSectionsMainProps {
  ticker: string;
  deal_id: string;
}

const FOSectionsMain: React.FC<FOSectionsMainProps> = ({ ticker, deal_id }) => {
  return (
    <div>
      <h1>FO Sections</h1>

      {/* Pass ticker & deal_id to every child */}
      <FOBusinessHighlights ticker={ticker} deal_id={deal_id} />
      <FOComparisionTableMain ticker={ticker} deal_id={deal_id} />
      <FODealInformation ticker={ticker} deal_id={deal_id} />
      <FOFinancialHighlights ticker={ticker} deal_id={deal_id} />
      <FOFutureOutlook ticker={ticker} deal_id={deal_id} />
      <FOManagementWriteUp ticker={ticker} deal_id={deal_id} />
      <FORecentNews ticker={ticker} deal_id={deal_id} />
      <FOSharePricePerfomance ticker={ticker} deal_id={deal_id} />
      <FOStrengthWriteUp ticker={ticker} deal_id={deal_id} />
      <FOValuationWriteup ticker={ticker} deal_id={deal_id} />
      <FOTradingDetails ticker={ticker} deal_id={deal_id} />
    </div>
  );
};

export default FOSectionsMain;
