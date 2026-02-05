import React, { FormEvent, useCallback, useMemo, useState } from 'react';
import { Alert, Box, Card, CardContent, Container, Divider, Grid, Stack, Typography } from '@mui/material';

import { DiscountFormValues } from './ABBDiscountConfig';
import ABBDiscountForm from './ABBDiscountForm';

/************************************
 * UTILITIES
 ***********************************/
const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const extractPrimaryResponse = (payload: unknown) => {
  if (!isPlainObject(payload)) return null;
  const candidateData = (payload as Record<string, unknown>).data;
  if (Array.isArray(candidateData) && candidateData.length && isPlainObject(candidateData[0])) {
    return candidateData[0] as Record<string, unknown>;
  }
  return payload;
};

const formatMetric = (value: unknown, options?: Intl.NumberFormatOptions) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'N/A';
  return value.toLocaleString(undefined, { maximumFractionDigits: 2, ...options });
};

const formatLabel = (key: string) =>
  key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'number' && !Number.isNaN(value)) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return String(value);
};

const normalizeYesNoValue = (value?: string) => (value?.trim().toLowerCase() === 'yes' ? 'yes' : 'no');
const parseNumberOrDefault = (value: string) => {
  const n = Number(String(value).replace(/,/g, '').trim());
  return Number.isNaN(n) ? 0 : n;
};

const initialFormValues: DiscountFormValues = {
  ticker: 'AAPL-US',
  tradeDate: '',
  seasoned: 'No',
  timing: 'No',
  cleanUp: 'No',
  primary: 'No',
  emergingMkt: 'No',
  dealCaptain: '',
  gicsSector: '',
  blockDealShares: '',
  blockDealPercentageOfMarketCap: '',
  blockDealValueLocal: '',
  blockDealValueDollar: '',
};

/************************************
 * PRESENTATIONAL BUILDING BLOCKS
 ***********************************/

// Unified Card wrapper to keep visuals consistent and heights aligned
const formatPercentValue = (value: unknown) =>
  typeof value === 'number' ? `${formatMetric(value)}%` : 'N/A';

const DiscountTile: React.FC<{
  title: string;
  gradient: string;
  titleColor: string;
  children: React.ReactNode;
}> = ({ title, gradient, titleColor, children }) => (
  <Box
    sx={{
      borderRadius: '18px',
      padding: 2,
      background: gradient,
      border: '1px solid rgba(2, 32, 96, 0.15)',
      boxShadow: '0 12px 30px rgba(4,28,70,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      minHeight: 160,
    }}
  >
    <Typography variant="body1" sx={{ fontWeight: 700, color: titleColor }}>
      {title}
    </Typography>
    {children}
  </Box>
);

const KeyValueRow: React.FC<{
  label: string;
  value: unknown;
  valueColor?: string;
  suffix?: string;
}> = ({ label, value, valueColor = 'inherit', suffix = '' }) => {
  const isNum = typeof value === 'number' && Number.isFinite(value);
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.5 }}>
      <Typography variant="body2" sx={{ color: 'text.primary' }}>
        {formatLabel(label)}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600, color: valueColor }}>
        {isNum ? `${formatMetric(value)}${suffix}` : formatValue(value)}
      </Typography>
    </Box>
  );
};

const FactsetDataCard: React.FC<{ entries: [string, unknown][] }> = ({ entries }) => (
  <DiscountTile title="Public Market Data" titleColor="#0b6b57" gradient="linear-gradient(145deg, #f5fff9, #e6fff0)">
    {entries.length ? (
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(3, minmax(0, 1fr))',
            md: 'repeat(5, minmax(0, 1fr))',
          },
        }}
      >
        {entries.map(([k, v]) => (
          <Box
            key={k}
            sx={{
              background: 'rgba(255, 255, 255, 0.55)',
              borderRadius: '14px',
              padding: 1.1,
              border: '1px solid rgba(11, 107, 87, 0.15)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {formatLabel(k)}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#0b6b57' }}>
              {formatValue(v)}
            </Typography>
          </Box>
        ))}
      </Box>
    ) : (
      <Typography variant="body2" color="#000000">
        No Public Market Data available.
      </Typography>
    )}
  </DiscountTile>
);

const DiscountsListCard: React.FC<{ entries: [string, number][] }> = ({ entries }) => (
  <Box
    sx={{
      borderRadius: '20px',
      border: '1px solid rgba(11, 43, 87, 0.15)',
      background: 'linear-gradient(145deg, #fff7f0, #ffe8d9)',
      boxShadow: '0 18px 40px rgba(4,28,70,0.12)',
      padding: { xs: 2, sm: 3 },
      minHeight: 240,
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
    }}
  >
    <Typography variant="body1" sx={{ fontWeight: 700, color: '#9e3c00' }}>
      Discounts
    </Typography>
        {entries.length ? (
          <Stack spacing={0.75} sx={{ flex: 1 }}>
            {entries.map(([key, value]) => (
              <KeyValueRow
                key={key}
                label={key}
                value={value}
                suffix="%"
                valueColor={typeof value === 'number' && value < 0 ? '#a53d00' : '#0b6b57'}
              />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="#000000">
            No discount data available.
          </Typography>
    )}
  </Box>
);

const InsightsStrip: React.FC<{ detail: Record<string, unknown> }> = ({ detail }) => {
  const liquidity = typeof detail.liquidity_model_discount === 'number' ? (detail.liquidity_model_discount as number) : null;
  const total = typeof detail.final_discount === 'number' ? (detail.final_discount as number) : null;

  const discountsRaw = isPlainObject(detail.discounts) ? (detail.discounts as Record<string, unknown>) : {};
  const discountEntries = Object.entries(discountsRaw).filter(([, v]) => typeof v === 'number') as [string, number][];
  const standardDiscountEntries = discountEntries.filter(([key]) => !/d1/i.test(key));

  const fsData = isPlainObject(detail.fs_data) ? (detail.fs_data as Record<string, unknown>) : {};
  const { company_description, ...restFsData } = fsData;

  const generalEntries = Object.entries(detail).filter(
    ([key]) => !['liquidity_model_discount', 'final_discount', 'discounts', 'fs_data'].includes(key),
  );

  const factsetEntries: [string, unknown][] = [...generalEntries, ...Object.entries(restFsData)];

  return (
    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card
        sx={{
          borderRadius: '26px',
          boxShadow: '0 30px 70px rgba(15, 35, 95, 0.15)',
          border: '1px solid rgba(15, 35, 95, 0.1)',
          background: 'linear-gradient(180deg, #fdfdff 0%, #f3f5ff 100%)',
        }}
      >
        <CardContent sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1.5, sm: 2 } }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <DiscountTile
                title="Liquidity Model Discount"
                titleColor="#0b2b57"
                gradient="linear-gradient(145deg, #f1f6ff, #deeaff)"
              >
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#0b2b57' }}>
                  {formatPercentValue(liquidity)}
                </Typography>
              </DiscountTile>
            </Grid>
            <Grid item xs={12} md={6}>
              <DiscountTile
                title="Final Discount"
                titleColor="#0b6b57"
                gradient="linear-gradient(145deg, #eafbf1, #d4fff0)"
              >
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#0b6b57' }}>
                  {formatPercentValue(total)}
                </Typography>
              </DiscountTile>
            </Grid>
            <Grid item xs={12}>
              <DiscountsListCard entries={standardDiscountEntries} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <FactsetDataCard entries={factsetEntries} />
    </Box>
  );
};

/************************************
 * PAGE
 ***********************************/

const gradientShift = {
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
};

const ABBDiscountDataPage: React.FC = () => {
  const [formValues, setFormValues] = useState<DiscountFormValues>(initialFormValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverResponse, setServerResponse] = useState<Record<string, unknown> | null>(null);

  const responseDetail = useMemo(() => extractPrimaryResponse(serverResponse), [serverResponse]);

  const handleFieldChange = useCallback(
    (field: keyof DiscountFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = field === 'ticker' ? event.target.value.toUpperCase() : event.target.value;
      setFormValues((prev) => ({ ...prev, [field]: newValue }));
    },
    [],
  );

  const handleReset = useCallback(() => setFormValues(initialFormValues), []);

  const isSubmitDisabled = useMemo(() => !formValues.ticker.trim() || !formValues.tradeDate, [formValues.ticker, formValues.tradeDate]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setServerResponse(null);

      if (!formValues.ticker.trim()) return setError('Ticker is required.');
      if (!formValues.tradeDate) return setError('Trade date is required.');

      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        setError('API URL is not defined in environment variables');
        return;
      }

      const token = localStorage.getItem('access_token');
      const payload = {
        ticker: formValues.ticker.trim(),
        trade_date: formValues.tradeDate,
        launch_date: formValues.tradeDate,
        clean_up: normalizeYesNoValue(formValues.cleanUp),
        seasoned: normalizeYesNoValue(formValues.seasoned),
        timing: normalizeYesNoValue(formValues.timing),
        primary: normalizeYesNoValue(formValues.primary),
        emerging_mkt: normalizeYesNoValue(formValues.emergingMkt),
        block_deal_shares: parseNumberOrDefault(formValues.blockDealShares),
        block_deal_percentage_of_market_cap: parseNumberOrDefault(formValues.blockDealPercentageOfMarketCap),
        block_deal_value_in_local_currency: parseNumberOrDefault(formValues.blockDealValueLocal),
        block_deal_value_in_dollar: parseNumberOrDefault(formValues.blockDealValueDollar),
      };

      try {
        setLoading(true);
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(`${apiUrl}/api/abb_factset_data/`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        const json = await response.json();

        if (!response.ok) {
          const detail = (json as any)?.error || (json as any)?.detail || 'Unable to submit discount data.';
          setError(typeof detail === 'string' ? detail : 'Unable to submit discount data.');
          return;
        }

        setServerResponse(json ?? { message: 'Discount data submitted successfully.' });
      } catch (e) {
        setError('Unexpected error while submitting discount data.');
      } finally {
        setLoading(false);
      }
    },
    [formValues],
  );

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
        <CardContent sx={{ position: 'relative', zIndex: 2, background: 'transparent', borderRadius: '32px', p: { xs: 3, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#0b2b57' }} align="center">
            ABB Model Discount (Data Submission)
          </Typography>

          <ABBDiscountForm
            formValues={formValues}
            handleFieldChange={handleFieldChange}
            handleSubmit={handleSubmit}
            loading={loading}
            isSubmitDisabled={isSubmitDisabled}
            handleReset={handleReset}
          />

          <Divider sx={{ my: 3, borderColor: 'rgba(2,32,96,0.15)' }} />

          {error && !loading && (
            <Alert severity="error" sx={{ mt: 3, borderRadius: '14px', backgroundColor: 'rgba(255,203,203,0.95)', border: '1px solid rgba(192,42,42,0.4)' }}>
              {error}
            </Alert>
          )}

          {serverResponse && (
            <Alert severity="success" sx={{ mt: 3, borderRadius: '14px', background: 'linear-gradient(135deg, rgba(183,241,255,0.7), rgba(216,255,229,0.85))', border: '1px solid rgba(0,96,155,0.35)' }}>
              {(serverResponse as any).detail ? String((serverResponse as any).detail) : 'Discount successfully Generated.'}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* INSIGHTS: three cards in one horizontal strip */}
      {responseDetail && (
        <Box sx={{ mt: 4 }}>
          <InsightsStrip detail={responseDetail as Record<string, unknown>} />
        </Box>
      )}
    </Container>
  );
};

export default ABBDiscountDataPage;
