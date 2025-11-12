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

const gradientShift = {
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
};

const floatRise = {
  '@keyframes floatRise': {
    '0%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-6px)' },
    '100%': { transform: 'translateY(0px)' },
  },
};

const formFieldBase = {
  background: 'rgba(255,255,255,0.18)',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.4)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.11)',
  transition: 'transform 0.3s ease, border 0.3s ease',
  backdropFilter: 'blur(14px)',
  '& .MuiOutlinedInput-root': {
    borderRadius: 'inherit',
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(0,32,96,0.35)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(0,32,96,0.75)',
    },
  },
  '&:hover': {
    transform: 'translateY(-2px)',
  },
};

const summaryBoxBase = {
  borderRadius: '14px',
  padding: '1rem',
  minWidth: '160px',
  flex: '1 1 160px',
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(223,235,255,0.85), rgba(255,255,255,0.68))',
  border: '1px solid rgba(0,32,96,0.11)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 18px 40px rgba(0,32,96,0.22)',
  },
};

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
        value: formValues[field.key],
      })),
    ];
  }, [formValues]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Card
        sx={{
          borderRadius: '28px',
          boxShadow: '0 30px 60px rgba(2,32,96,0.25)',
          border: '1px solid rgba(255,255,255,0.4)',
          background: 'linear-gradient(135deg, rgba(235,247,255,0.95), rgba(218,229,255,0.93))',
          position: 'relative',
          overflow: 'hidden',
          ...gradientShift,
          backgroundSize: '300% 300%',
          animation: 'gradientShift 14s ease-in-out infinite',
        }}
      >
        <CardContent
          sx={{
            position: 'relative',
            zIndex: 2,
            color: '#041434',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            ABB Discount Data
          </Typography>
          <Typography variant="body2" sx={{ color: '#0d1c49', mb: 3 }}>
            Enter the richer discount profile you want to push to ABB.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Ticker"
                  value={formValues.ticker}
                  onChange={handleFieldChange('ticker')}
                  required
                  InputLabelProps={{
                    shrink: true,
                    sx: { color: '#0c1d3f', fontWeight: 600 },
                  }}
                  sx={{
                    ...formFieldBase,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  type="date"
                  label="Trade Date"
                  value={formValues.tradeDate}
                  onChange={handleFieldChange('tradeDate')}
                  required
                  InputLabelProps={{
                    shrink: true,
                    sx: { color: '#0c1d3f', fontWeight: 600 },
                  }}
                  sx={{
                    ...formFieldBase,
                  }}
                />
              </Grid>

              {discountFields.map((field) => (
                <Grid item xs={12} sm={6} md={4} key={field.key}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label={field.label}
                    placeholder={field.helper}
                    value={formValues[field.key]}
                    onChange={handleFieldChange(field.key)}
                    helperText={field.helper}
                    InputLabelProps={{ sx: { color: '#0c1d3f', fontWeight: 600 } }}
                    sx={{
                      ...formFieldBase,
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
                  ...floatRise,
                  animation: 'floatRise 6.5s ease-in-out infinite',
                  background: 'linear-gradient(145deg, #002060, #0060c8)',
                  borderRadius: '16px',
                  paddingX: 3.5,
                  paddingY: 1.4,
                  boxShadow: '0 10px 30px rgba(0,32,96,0.45)',
                  textTransform: 'capitalize',
                  '&.Mui-disabled': {
                    background: 'rgba(0,32,96,0.4)',
                    boxShadow: '0 6px 20px rgba(0,32,96,0.25)',
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

          <Divider sx={{ my: 3, borderColor: 'rgba(0,32,96,0.25)' }} />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {summaryRows.map((row) => (
              <Box key={row.label} sx={{ ...summaryBoxBase }}>
                <Typography variant="caption" sx={{ color: '#00183b' }}>
                  {row.label}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#002060', fontWeight: 600 }}>
                  {row.value || 'N/A'}
                </Typography>
              </Box>
            ))}
          </Box>

          {error && !loading && (
            <Alert
              severity="error"
              sx={{
                mt: 3,
                borderRadius: '12px',
                backgroundColor: 'rgba(255,231,231,0.9)',
                border: '1px solid rgba(192,42,42,0.3)',
              }}
            >
              {error}
            </Alert>
          )}

          {serverResponse && (
            <Alert
              severity="success"
              sx={{
                mt: 3,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(208,248,255,0.8), rgba(235,255,241,0.9))',
                border: '1px solid rgba(0,96,155,0.3)',
              }}
            >
              {serverResponse.detail
                ? String(serverResponse.detail)
                : 'Discount payload delivered to ABB API successfully.'}
            </Alert>
          )}
        </CardContent>

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 20%, rgba(0,96,255,0.18), transparent 60%), radial-gradient(circle at 80% 0%, rgba(0,32,96,0.22), transparent 55%)',
            opacity: 0.8,
            pointerEvents: 'none',
          }}
        />
      </Card>
    </Container>
  );
};

export default ABBDiscountDataMainFunction;
