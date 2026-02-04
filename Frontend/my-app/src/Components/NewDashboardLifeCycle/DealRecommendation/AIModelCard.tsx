
import { FewShotReview } from "./DealRecommendationHome";
import { SectionCard } from "./SectionCard";


export function AIModelCard({ fewShot }: { fewShot: FewShotReview }) {
  return (
    <SectionCard title="AI Model (Few-shot Review)">
      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
        {JSON.stringify(fewShot, null, 2)}
      </pre>
    </SectionCard>
  );
}