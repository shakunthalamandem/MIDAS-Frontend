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
  MenuItem,
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

const yesNoOptions = ['Yes', 'No'] as const;

const gradientShift = {
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
};

const formFieldBase = {
  background: 'transparent',
  borderRadius: 0,
  '& .MuiInput-root': {
    fontSize: '0.95rem',
    '&:before': {
      borderBottomColor: 'rgba(2,32,96,0.25)',
    },
    '&:after': {
      borderBottomColor: 'rgba(0,90,255,0.95)',
    },
  },
  '& .MuiInput-root.Mui-focused:after': {
    borderBottomColor: 'rgba(0,90,255,0.95)',
  },
};

const summaryBoxBase = {
  borderRadius: '8px',
  padding: '0.65rem',
  minWidth: '140px',
  flex: '1 1 150px',
  background: 'transparent',
  borderBottom: '1px solid rgba(0,0,0,0.12)',
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
          borderRadius: '32px',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(2,32,96,0.1)',
          background: 'linear-gradient(145deg, #dbefff 0%, #e6f6ff 60%, #fcfdff 100%)',
          color: '#041434',
          boxShadow: '0 15px 45px rgba(2,32,96,0.18)',
          ...gradientShift,
          backgroundSize: '380% 380%',
          animation: 'gradientShift 28s ease-in-out infinite',
        }}
      >
        <CardContent
          sx={{
            position: 'relative',
            zIndex: 2,
            background: 'transparent',
            borderRadius: '32px',
            padding: { xs: 3, md: 4 },
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#0b2b57' }}>
            ABB Discount Data
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1 }}>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  variant="standard"
                  label="Ticker"
                  value={formValues.ticker}
                  onChange={handleFieldChange('ticker')}
                  required
                  InputLabelProps={{
                    shrink: true,
                    sx: { color: '#1d2b54', fontWeight: 600 },
                  }}
                  sx={{
                    ...formFieldBase,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  variant="standard"
                  type="date"
                  label="Trade Date"
                  value={formValues.tradeDate}
                  onChange={handleFieldChange('tradeDate')}
                  required
                  InputLabelProps={{
                    shrink: true,
                    sx: { color: '#1d2b54', fontWeight: 600 },
                  }}
                  sx={{
                    ...formFieldBase,
                  }}
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'nowrap',
                gap: 2,
                mt: 3,
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': {
                  height: 4,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#cfd5ec',
                  borderRadius: 2,
                },
              }}
            >
              {discountFields.map((field) => (
                <TextField
                  key={field.key}
                  select
                  variant="standard"
                  label={field.label}
                  value={formValues[field.key]}
                  onChange={handleFieldChange(field.key)}
                  InputLabelProps={{
                    shrink: true,
                    sx: { color: '#1d2b54', fontWeight: 600 },
                  }}
                  SelectProps={{
                    displayEmpty: true,
                  }}
                  sx={{
                    ...formFieldBase,
                    flex: '1 1 18%',
                    minWidth: { xs: 150, md: 170 },
                    '& .MuiSelect-select': {
                      paddingTop: 1.25,
                      paddingBottom: 1.25,
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select option
                  </MenuItem>
                  {yesNoOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              ))}
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'center', md: 'flex-start' },
                alignItems: 'center',
                gap: 2,
                mt: { xs: 3, md: 4 },
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="contained"
                type="submit"
                disabled={loading || isSubmitDisabled}
                sx={{
                  background: '#0b2b57',
                  borderRadius: '18px',
                  paddingX: 3.5,
                  paddingY: 1.25,
                  boxShadow: '0 12px 30px rgba(11,43,87,0.18)',
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#fff',
                  '&:hover': {
                    background: '#0a264d',
                  },
                }}
              >
                {loading ? 'Processing...' : 'Submit to ABB API'}
              </Button>

              <Box sx={{ flexGrow: 1, maxWidth: 320, pl: { md: 4 } }}>
                <Typography variant="body2" sx={{ color: '#1d2b54' }}>
                  The payload contains the discount flags above plus the ticker and trade date submitted.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3, borderColor: 'rgba(2,32,96,0.15)' }} />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mt: 1 }}>
            {summaryRows.map((row) => (
              <Box key={row.label} sx={{ ...summaryBoxBase }}>
                <Typography variant="caption" sx={{ color: '#0f1f43' }}>
                  {row.label}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#021b4c', fontWeight: 600, mt: 0.25 }}>
                  {row.value || 'Not set'}
                </Typography>
              </Box>
            ))}
          </Box>

          {error && !loading && (
            <Alert
              severity="error"
              sx={{
                mt: 3,
                borderRadius: '14px',
                backgroundColor: 'rgba(255,203,203,0.95)',
                border: '1px solid rgba(192,42,42,0.4)',
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
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(183,241,255,0.7), rgba(216,255,229,0.85))',
                border: '1px solid rgba(0,96,155,0.35)',
              }}
            >
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
