/**
 * AIMLIntelligencePanel — DEPRECATED
 *
 * This component's content (ML Predictions, AI Unsupervised Outlook,
 * Sentiment Analysis) has been moved into popup dialogs triggered from
 * the IntelligenceSourcesBar. Each source card now opens a popup showing
 * its parameters and data when clicked.
 *
 * This file is kept as a no-op export so any stale imports don't break
 * the build. It can be safely deleted once all references are removed.
 */
import React from "react";

interface Props {
  ticker: string;
  mlPredictionsRef?: React.RefObject<HTMLDivElement>;
  aiModelRef?: React.RefObject<HTMLDivElement>;
  aiSentimentRef?: React.RefObject<HTMLDivElement>;
  onDataStatus?: (status: any) => void;
  onDataPoints?: (points: any) => void;
}

const AIMLIntelligencePanel: React.FC<Props> = () => {
  // Content moved to popup dialogs in TradingSignalsMain.tsx
  return null;
};

export default AIMLIntelligencePanel;
