import { DealRecommendationResponse } from "./DealRecommendationHome";
import { SectionCard } from "./SectionCard";



export function AMOutputCard({
  t1d_overall_rating,
  t1w_overall_rating,
  t1m_overall_rating,
  AM_strategy_recommendation,
  potential_am_quantity,
}: Pick<
  DealRecommendationResponse,
  | "t1d_overall_rating"
  | "t1w_overall_rating"
  | "t1m_overall_rating"
  | "AM_strategy_recommendation"
  | "potential_am_quantity"
>) {
  return (
    <SectionCard title="AM Output">
      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
        {JSON.stringify(
          {
            t1d_overall_rating,
            t1w_overall_rating,
            t1m_overall_rating,
            AM_strategy_recommendation,
            potential_am_quantity,
          },
          null,
          2
        )}
      </pre>
    </SectionCard>
  );
}
