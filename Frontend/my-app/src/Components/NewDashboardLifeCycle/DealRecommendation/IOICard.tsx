import { SectionCard } from "./SectionCard";


export function IOICard({ ioi_dollar_value }: { ioi_dollar_value: string }) {
  return (
    <SectionCard title="IOI">
      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
        {JSON.stringify({ ioi_dollar_value }, null, 2)}
      </pre>
    </SectionCard>
  );
}