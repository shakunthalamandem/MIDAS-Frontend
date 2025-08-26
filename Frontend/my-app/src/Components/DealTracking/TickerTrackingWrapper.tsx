import { useLocation } from "react-router-dom";
import TickerTracking from "./TickerTracking"; // Import your TickerTracking component

const TickerTrackingWrapper: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const ticker = queryParams.get("ticker");
  const pricingDate = queryParams.get("pricing_date");

  // Ensure ticker and pricing_date are available before rendering TickerTracking
  if (!ticker || !pricingDate) {
    return <div>Loading or error: Missing ticker or pricing date.</div>;
  }

  return <TickerTracking ticker={ticker} pricing_date={pricingDate} />;
};

export default TickerTrackingWrapper;
