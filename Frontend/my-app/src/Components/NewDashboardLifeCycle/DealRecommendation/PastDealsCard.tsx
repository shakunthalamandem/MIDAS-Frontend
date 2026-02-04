import { DealRecommendationResponse } from "./DealRecommendationHome";
import { SectionCard } from "./SectionCard";


export function PastDealsCard({
  peers_count,
  peers_ticker_list,
  peers_t1d_avg_price,
  peers_t1w_avg_price,
  peers_t1m_avg_price,
}: Pick<
  DealRecommendationResponse,
  | "peers_count"
  | "peers_ticker_list"
  | "peers_t1d_avg_price"
  | "peers_t1w_avg_price"
  | "peers_t1m_avg_price"
>) {
  return (
    <SectionCard title="Past Deals / Peers">
      <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
        {JSON.stringify(
          {
            peers_count,
            peers_ticker_list,
            peers_t1d_avg_price,
            peers_t1w_avg_price,
            peers_t1m_avg_price,
          },
          null,
          2
        )}
      </pre>
    </SectionCard>
  );
}
