import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useLocation, useParams } from "react-router-dom";
import FOSectionsMain from "./FOWriteUpHooks/FOSectionsMain";

interface FOWriteUpDashboardMainProps {
  ticker?: string;
  deal_id?: string;
}

const FOWriteUpDashboardMain: React.FC<FOWriteUpDashboardMainProps> = ({
  ticker,
  deal_id,
}) => {
  const { ticker: paramTicker } = useParams<{ ticker: string }>();
  const location = useLocation();
  const [selected, setSelected] = useState<{
    ticker: string;
    deal_id: string;
  } | null>(() => {
    const state = location.state as { deal_id?: string } | null;
    const resolvedTicker = ticker ?? paramTicker ?? "";
    return resolvedTicker
      ? { ticker: resolvedTicker, deal_id: deal_id ?? state?.deal_id ?? "" }
      : null;
  });

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const resolvedTicker = ticker ?? paramTicker ?? "";
    if (!resolvedTicker) {
      setSelected(null);
      return;
    }
    const state = location.state as { deal_id?: string } | null;
    setSelected({
      ticker: resolvedTicker,
      deal_id: deal_id ?? state?.deal_id ?? "",
    });
  }, [paramTicker, ticker, deal_id, location.state]);

  useEffect(() => {
    const resolvedTicker = ticker ?? paramTicker ?? "";
    if (!resolvedTicker || !apiUrl) return;
    if (selected?.deal_id) return;

    const fetchDealId = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/fowriteup_ticker_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker: resolvedTicker }),
        });

        if (!response.ok) return;
        const data = await response.json();
        if (data?.deal_id) {
          setSelected({ ticker: resolvedTicker, deal_id: data.deal_id });
        }
      } catch (error) {
        console.error("Failed to resolve FO deal id", error);
      }
    };

    fetchDealId();
  }, [apiUrl, paramTicker, ticker, selected?.deal_id, token]);

  const resolvedTicker = ticker ?? paramTicker ?? "";
  if (!resolvedTicker) return null;

  return (
    <Box mt={4}>
      <FOSectionsMain
        ticker={resolvedTicker}
        deal_id={selected?.deal_id ?? ""}
        selected={selected}
        setSelected={setSelected}
      />
    </Box>
  );
};

export default FOWriteUpDashboardMain;
