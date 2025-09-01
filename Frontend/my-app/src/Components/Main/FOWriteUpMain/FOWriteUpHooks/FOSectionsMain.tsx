import React from 'react';
import FOComparisionTableMain from '../FOWriteSections/FOComparisionTableMain';
import FOFinancialHighlights from '../FOWriteSections/FOFinancialHighlights';
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
    </>
  );
};

export default FOSectionsMain;
