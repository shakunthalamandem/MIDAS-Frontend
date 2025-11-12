import React, { FormEvent, useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';

interface DiscountFormValues {
  ticker: string;
  tradeDate: string;
  seasoned: string;
  timing: string;
  cleanUp: string;
  primary: string;
  emergingMkt: string;
}

const discountFields: Array<{
  key: keyof Omit<DiscountFormValues, 'ticker' | 'tradeDate'>;
  label: string;
  helper: string;
}> = [
  { key: 'seasoned', label: 'Seasoned', helper: 'Input the seasoned capital detail or score.' },
  { key: 'timing', label: 'Timing', helper: 'Describe the targeted entry timing plan.' },
  { key: 'cleanUp', label: 'Clean Up', helper: 'Mention any clean-up phases or checkpoints.' },
  { key: 'primary', label: 'Primary', helper: 'Explain the primary market focus or thesis.' },
  { key: 'emergingMkt', label: 'Emerging mkt', helper: 'Share the emerging market focus or notes.' },
];

const ABBDiscountDataMainFunction: React.FC = () => {
  const [formValues, setFormValues] = useState<DiscountFormValues>({
    ticker: 'AAPL-US',
    tradeDate: '',
    seasoned: '',
    timing: '',
    cleanUp: '',
    primary: '',
    emergingMkt: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverResponse, setServerResponse] = useState<Record<string, unknown> | null>(null);

  const handleFieldChange = useCallback(
    (field: keyof DiscountFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    },
    [],
  );

  const isSubmitDisabled = useMemo(() => {
    return !formValues.ticker.trim() || !formValues.tradeDate;
  }, [formValues.ticker, formValues.tradeDate]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setServerResponse(null);

      if (!formValues.ticker.trim()) {
        setError('Ticker is required.');
        return;
      }

      if (!formValues.tradeDate) {
        setError('Trade date is required.');
        return;
      }

      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        throw new Error('API URL is not defined in environment variables');
      }

      const token = localStorage.getItem('access_token');
      const payload = {
        ticker: formValues.ticker.trim(),
        trade_date: formValues.tradeDate,
        seasoned: formValues.seasoned.trim(),
        timing: formValues.timing.trim(),
        clean_up: formValues.cleanUp.trim(),
        primary: formValues.primary.trim(),
        emerging_mkt: formValues.emergingMkt.trim(),
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
          const detail = json?.error || json?.detail || 'Unable to submit discount data.';
          setError(typeof detail === 'string' ? detail : 'Unable to submit discount data.');
          return;
        }

        setServerResponse(json ?? { message: 'Discount data submitted successfully.' });
      } catch (submitError) {
        setError('Unexpected error while submitting discount data.');
      } finally {
        setLoading(false);
      }
    },
    [formValues],
  );

  const summaryRows = useMemo(() => {
    return [
      { label: 'Ticker', value: formValues.ticker },
      { label: 'Trade Date', value: formValues.tradeDate },
      ...discountFields.map((field) => ({
        label: field.label,
        value: formValues[field.key] || '—',
      })),
    ];
  }, [formValues]);

  return (
    <Container sx={{ py: 4 }} maxWidth="xl">
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 20px 50px rgba(0, 32, 96, 0.2)',
        background: 'linear-gradient(155deg, #f5f7ff 0%, #ffffff 60%)',
        border: '1px solid rgba(0, 32, 96, 0.15)',
      }}
    >
      <CardContent sx={{ minHeight: 420, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #002060, rgba(0, 32, 96, 0.65))',
            borderRadius: '18px',
            padding: 2,
            color: '#fff',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            ABB Discount Model
          </Typography>
          
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ticker"
                value={formValues.ticker}
                onChange={handleFieldChange('ticker')}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Trade Date"
                value={formValues.tradeDate}
                onChange={handleFieldChange('tradeDate')}
                required
                InputLabelProps={{ shrink: true }}
                sx={{ borderRadius: '12px', backgroundColor: '#ffffff' }}
              />
            </Grid>

            {discountFields.map((field) => (
              <Grid item xs={12} sm={6} md={4} key={field.key}>
                <TextField
                  fullWidth
                  label={field.label}
                  placeholder={field.helper}
                  value={formValues[field.key]}
                  onChange={handleFieldChange(field.key)}
                  helperText={field.helper}
                  sx={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                  }}
                />
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'center', sm: 'space-between' },
              alignItems: 'center',
              gap: 2,
              mt: 3,
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="contained"
              type="submit"
              disabled={loading || isSubmitDisabled}
              sx={{
                backgroundColor: '#002060',
                color: '#fff',
                paddingX: 3,
                paddingY: 1.25,
                borderRadius: '14px',
                '&:hover': {
                  backgroundColor: '#001a4f',
                },
              }}
            >
              {loading ? 'Processing...' : 'Submit to ABB API'}
            </Button>

            <Box sx={{ flexGrow: 1, maxWidth: 320 }}>
              <Typography variant="body2" sx={{ color: '#0f1b3f' }}>
                The payload includes the discount labels you define above plus the ticker and trade
                date.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {summaryRows.map((row) => (
            <Box
              key={row.label}
              sx={{
                flex: '1 1 160px',
                padding: 1.25,
                borderRadius: '12px',
                background: 'rgba(0, 32, 96, 0.05)',
              }}
            >
              <Typography variant="caption" sx={{ color: '#00183b' }}>
                {row.label}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#002060' }}>
                {row.value || '—'}
              </Typography>
            </Box>
          ))}
        </Box>

        {error && !loading && <Alert severity="error">{error}</Alert>}

        {serverResponse && (
          <Alert severity="success">
            {serverResponse.detail
              ? String(serverResponse.detail)
              : 'Discount payload delivered to ABB API successfully.'}
          </Alert>
        )}
      </CardContent>
    </Card>
    </Container>
  );
};

export default ABBDiscountDataMainFunction;
