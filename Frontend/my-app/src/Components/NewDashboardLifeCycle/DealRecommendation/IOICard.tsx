import { SectionCard } from "./SectionCard";


export function IOICard({ ioi_dollar_value, deal_size }: { ioi_dollar_value: number, deal_size: number }) {
  return (
    <SectionCard title="IOI">
      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
        {JSON.stringify({ ioi_dollar_value, deal_size }, null, 2)}
      </pre>
    </SectionCard>
  );
}