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
import FOSummaryDataSection from './FOSummaryDataSection';



interface FOSectionsMainProps {
  ticker: string;
  deal_id: string;
}

const FOSectionsMain: React.FC<FOSectionsMainProps> = ({ ticker, deal_id }) => {
  return (
    <>

      {/* Pass ticker & deal_id to every child */}
      <FOSummaryDataSection ticker={ticker} deal_id={deal_id} />


      <FOComparisionTableMain ticker={ticker} deal_id={deal_id} />
      <FOFinancialHighlights ticker={ticker} deal_id={deal_id} />
      <FORecentNews ticker={ticker} deal_id={deal_id} />
    </>
  );
};

export default FOSectionsMain;
