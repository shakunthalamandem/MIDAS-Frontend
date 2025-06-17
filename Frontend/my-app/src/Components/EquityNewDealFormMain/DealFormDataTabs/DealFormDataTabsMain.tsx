import React from 'react';
import DealInformation from './DealInformation';
import DealAllocations from './DealAllocations';
import MarketData from './MarketData';
import TechnicalMarketData from './TechnicalMarketData';
import DealColor from './DealColor';
interface Props {
  formData: any;
  isCreate: boolean;
}

const DealFormDataTabsMain: React.FC<Props> = ({ formData, isCreate }) => {
  return (
    <div>
      <DealInformation data={formData?.info || {}} isCreate={isCreate} />
      <DealAllocations data={formData?.allocations || {}} isCreate={isCreate} />
      <MarketData data={formData?.marketData || {}} isCreate={isCreate} />
      <TechnicalMarketData data={formData?.technical || {}} isCreate={isCreate} />
      <DealColor data={formData?.color || {}} isCreate={isCreate} />
    </div>
  );
};

export default DealFormDataTabsMain;