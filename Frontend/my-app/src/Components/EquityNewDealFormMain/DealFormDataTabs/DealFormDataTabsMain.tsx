import React, { useState } from 'react';
import { Box, Button, Card, Stack } from '@mui/material';
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
  const [editable, setEditable] = useState<boolean>(isCreate);
  const [localData, setLocalData] = useState(formData);
  const [originalData] = useState(formData);

  const handleCancel = () => {
    setLocalData(originalData);
    setEditable(false);
  };

  const handleReset = () => {
    setLocalData({});
    setEditable(true);
  };

  const handleEdit = () => {
    setEditable(true);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Stack direction="row" spacing={2} mb={2}>
        {editable ? (
          <>
            <Button variant="contained" color="primary">{isCreate ? 'Create' : 'Save'}</Button>
            <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
            <Button variant="outlined" onClick={handleReset}>Reset</Button>
          </>
        ) : (
          <Button variant="contained" color="secondary" onClick={handleEdit}>Edit</Button>
        )}
      </Stack>
      <DealInformation data={localData?.deal_information || {}} editable={editable} onChange={(updated: any) => setLocalData({ ...localData, deal_information: updated })} />
      <DealAllocations data={localData?.deal_allocations || {}} editable={editable} onChange={(updated: any) => setLocalData({ ...localData, deal_allocations: updated })} />
      <MarketData data={localData?.market_data || {}} editable={editable} onChange={(updated: any) => setLocalData({ ...localData, market_data: updated })} />
      <TechnicalMarketData data={localData?.technical_market_data || {}} editable={editable} onChange={(updated: any) => setLocalData({ ...localData, technical_market_data: updated })} />
      <DealColor data={localData?.deal_color || {}} editable={editable} onChange={(updated: any) => setLocalData({ ...localData, deal_color: updated })} />
    </Box>
  );
};

export default DealFormDataTabsMain;