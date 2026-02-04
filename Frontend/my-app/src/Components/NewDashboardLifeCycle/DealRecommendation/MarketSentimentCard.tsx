import { SectionCard } from "./SectionCard";




export function MarketSentimentCard({
  one_week_sentiment,
  one_month_sentiment,
  sentiment_summary,
}: {
  one_week_sentiment: string;
  one_month_sentiment: string;
  sentiment_summary: string;
}) {
  return (
    <SectionCard title="Market Sentiment">
      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
        {JSON.stringify(
          { one_week_sentiment, one_month_sentiment, sentiment_summary },
          null,
          2
        )}
      </pre>
    </SectionCard>
  );
}