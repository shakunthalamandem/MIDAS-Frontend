import React, { useState } from 'react';
import { Box, Button, Stack, Alert, Snackbar } from '@mui/material';
import { Save, Edit, Ambulance as Cancel, RotateCcw, Plus } from 'lucide-react';
import DealInformation from '../DealFormDataTabs/DealInformation';
import DealAllocations from '../DealFormDataTabs/DealAllocations';
import MarketData from '../DealFormDataTabs/MarketData';
import TechnicalMarketData from '../DealFormDataTabs/TechnicalMarketData';
import DealColor from '../DealFormDataTabs/DealColor';

interface FormData {
  deal_information: Record<string, any>;
  deal_allocations: Record<string, any>;
  market_data: Record<string, any>;
  technical_market_data: Record<string, any>;
  deal_color: Record<string, any>;
}

interface Props {
  formData: FormData;
  isCreate: boolean;
}

const DealFormDataTabsMain: React.FC<Props> = ({ formData, isCreate }) => {
  const [editable, setEditable] = useState<boolean>(isCreate);
  const [localData, setLocalData] = useState<FormData>(formData);
  const [originalData] = useState<FormData>(formData);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSave = async () => {
    try {
      console.log('Saving data:', localData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEditable(false);
      setSnackbar({
        open: true,
        message: isCreate ? 'Deal created successfully!' : 'Deal updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save deal. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCancel = () => {
    setLocalData(originalData);
    setEditable(false);
  };

  const handleReset = () => {
    const emptyData: FormData = {
      deal_information: {},
      deal_allocations: {},
      market_data: {},
      technical_market_data: {},
      deal_color: {},
    };
    setLocalData(emptyData);
  };

  const handleEdit = () => {
    setEditable(true);
  };

  const updateSection = (section: keyof FormData, data: Record<string, any>) => {
    setLocalData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        {editable ? (
          <>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={isCreate ? <Plus size={18} /> : <Save size={18} />}
              onClick={handleSave}
            >
              {isCreate ? 'Create Deal' : 'Save Changes'}
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Cancel size={18} />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              variant="outlined" 
              color="warning"
              startIcon={<RotateCcw size={18} />}
              onClick={handleReset}
            >
              Reset
            </Button>
          </>
        ) : (
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<Edit size={18} />}
            onClick={handleEdit}
          >
            Edit Deal
          </Button>
        )}
      </Stack>
      <DealInformation 
        data={localData?.deal_information || {}} 
        editable={editable} 
        onChange={(data: Record<string, any>) => updateSection('deal_information', data)} 
      />
      
      <DealAllocations 
        data={localData?.deal_allocations || {}} 
        editable={editable} 
        onChange={(data: Record<string, any>) => updateSection('deal_allocations', data)} 
      />
      
      <MarketData 
        data={localData?.market_data || {}} 
        editable={editable} 
        onChange={(data: Record<string, any>) => updateSection('market_data', data)} 
      />
      
      <TechnicalMarketData 
        data={localData?.technical_market_data || {}} 
        editable={editable} 
        onChange={(data: Record<string, any>) => updateSection('technical_market_data', data)} 
      />
      
      <DealColor 
        data={localData?.deal_color || {}} 
        editable={editable} 
        onChange={(data: Record<string, any>) => updateSection('deal_color', data)} 
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DealFormDataTabsMain;