import { DealData } from './types';

// Helper function for sentiment color
export const getSentimentColor = (sentiment: string | null) => {
  if (!sentiment) return 'default' as const;
  const lower = sentiment.toLowerCase();
  if (lower.includes('bearish')) return 'error' as const;
  if (lower.includes('bullish')) return 'success' as const;
  if (lower.includes('neutral')) return 'warning' as const;
  return 'default' as const;
};

// Helper function for prediction color
export const getPredictionColor = (prediction: string | null) => {
  if (!prediction) return 'default' as const;
  const lower = prediction.toLowerCase();
  if (lower.includes('negative')) return 'error' as const;
  if (lower.includes('positive')) return 'success' as const;
  if (lower.includes('neutral')) return 'warning' as const;
  return 'default' as const;
};

// Helper function for quant signal color
export const getQuantSignalColor = (signal: string | null) => {
  if (!signal) return 'default' as const;
  const lower = signal.toLowerCase();
  if (lower.includes('buy')) return 'success' as const;
  if (lower.includes('sell')) return 'error' as const;
  if (lower.includes('hold')) return 'warning' as const;
  return 'default' as const;
};

// Helper function for gator signal color (same as sentiment)
export const getGatorSignalColor = (signal: string | null) => {
  if (!signal) return 'default' as const;
  const lower = signal.toLowerCase();
  if (lower.includes('bullish') || lower.includes('buy')) return 'success' as const;
  if (lower.includes('bearish') || lower.includes('sell')) return 'error' as const;
  if (lower.includes('neutral') || lower.includes('hold')) return 'warning' as const;
  return 'default' as const;
};

// Parse volatility outlook from few_shot_review JSON
export const parseVolatilityOutlook = (unsupervisedData: any, ticker: string) => {
  if (!unsupervisedData?.few_shot_review) return null;
  try {
    let parsed = JSON.parse(unsupervisedData.few_shot_review);
    console.log('Parsed few_shot_review for', ticker, ':', parsed);

    // Handle different structures
    let answer = null;
    if (parsed.answer && Array.isArray(parsed.answer)) {
      answer = parsed.answer[0];
    } else if (Array.isArray(parsed)) {
      answer = parsed[0];
    }

    if (answer && answer['Final Sentiment & Volatility Outlook']) {
      const outlook = answer['Final Sentiment & Volatility Outlook'];
      console.log('Final outlook for', ticker, ':', outlook);
      return outlook;
    }
  } catch (e) {
    console.error('Parse error for', ticker, ':', e);
    return null;
  }
  return null;
};

// Get pricing date from deal object
export const getPricingDate = (deal: DealData, selectedCard: string) => {
  if (selectedCard === 'portfolio') {
    return (
      deal.unsupervised_summary?.pricing_date ||
      deal.pricing_date ||
      deal.trade_date ||
      'N/A'
    );
  }
  return deal.pricing_date || deal.trade_date || 'N/A';
};
