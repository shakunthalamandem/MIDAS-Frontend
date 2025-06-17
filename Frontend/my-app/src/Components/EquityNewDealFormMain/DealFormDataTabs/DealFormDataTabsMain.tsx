import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Grow,
  Fade,
} from '@mui/material';
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

  const renderCard = (
    title: string,
    Component: React.ReactNode,
    key: string,
    gradient: string
  ) => (
    <Grow in key={key} timeout={600}>
      <Card
        sx={{
          height: '100%',
          borderRadius: 3,
          boxShadow: 6,
          background: gradient,
          color: '#fff',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            fontWeight={600}
            mb={2}
            sx={{ textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}
          >
            {title}
          </Typography>
          {Component}
        </CardContent>
      </Card>
    </Grow>
  );

  return (
    <Fade in timeout={500}>
      <Box display="flex" flexDirection="column" gap={4} p={2}>
        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          {editable ? (
            <>
              <Button variant="contained" color="primary">
                {isCreate ? 'Create' : 'Save'}
              </Button>
              <Button variant="outlined" color="inherit" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleReset}>
                Reset
              </Button>
            </>
          ) : (
            <Button variant="contained" color="secondary" onClick={handleEdit}>
              Edit
            </Button>
          )}
        </Stack>

        {/* Cards Layout */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderCard(
              'Deal Information',
              <DealInformation
                data={localData?.deal_information || {}}
                editable={editable}
                onChange={(updated: any) =>
                  setLocalData({ ...localData, deal_information: updated })
                }
              />,
              'deal-information',
              'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)'
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderCard(
              'Deal Allocations',
              <DealAllocations
                data={localData?.deal_allocations || {}}
                editable={editable}
                onChange={(updated: any) =>
                  setLocalData({ ...localData, deal_allocations: updated })
                }
              />,
              'deal-allocations',
              'linear-gradient(135deg, #7b1fa2 0%, #e040fb 100%)'
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderCard(
              'Market Data',
              <MarketData
                data={localData?.market_data || {}}
                editable={editable}
                onChange={(updated: any) =>
                  setLocalData({ ...localData, market_data: updated })
                }
              />,
              'market-data',
              'linear-gradient(135deg, #43a047 0%, #76ff03 100%)'
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderCard(
              'Technical Market Data',
              <TechnicalMarketData
                data={localData?.technical_market_data || {}}
                editable={editable}
                onChange={(updated: any) =>
                  setLocalData({ ...localData, technical_market_data: updated })
                }
              />,
              'technical-market-data',
              'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)'
            )}
          </Grid>

          {/* Deal Color Full Width */}
          <Grid item xs={12}>
            {renderCard(
              'Deal Color',
              <DealColor
                data={localData?.deal_color || {}}
                editable={editable}
                onChange={(updated: any) =>
                  setLocalData({ ...localData, deal_color: updated })
                }
              />,
              'deal-color',
              'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)'
            )}
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default DealFormDataTabsMain;
