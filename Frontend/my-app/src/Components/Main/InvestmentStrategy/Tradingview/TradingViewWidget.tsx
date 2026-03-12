import React, { useEffect, useRef, memo } from "react";
import { Box } from "@mui/material";

interface TradingViewWidgetProps {
  ticker: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ ticker }) => {
  const cleanedTicker = ticker.replace(/\s+US$/, "");
  const container = useRef<HTMLDivElement | null>(null);
  const loadIdRef = useRef(0);

  useEffect(() => {
    if (!container.current) {
      console.error("Container reference is null.");
      return;
    }

    loadIdRef.current += 1;
    const loadId = loadIdRef.current;

    // Clean up any existing widget before loading a new one
    container.current.innerHTML = `
      <div class="tradingview-widget-container__widget"></div>
    `;

    const timeoutId = window.setTimeout(() => {
      if (!container.current) return;
      if (loadId !== loadIdRef.current) return;

      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "autosize": true,
          "symbol": "${cleanedTicker}",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "light",
          "style": "1",
          "locale": "en",
          "allow_symbol_change": true,
          "calendar": false,
          "withdateranges": true,
          "hide_side_toolbar": false,
          "support_host": "https://www.tradingview.com"
        }
      `;
      container.current
        .querySelector(".tradingview-widget-container__widget")
        ?.appendChild(script);
    }, 100);

    // Cleanup on unmount
    return () => {
      window.clearTimeout(timeoutId);
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, [cleanedTicker]);

  return (
    <Box
      ref={container}
      className="tradingview-widget-container"
      sx={{
        height: 550,
        width: "100%",
        "& .tradingview-widget-container__widget": {
          height: "100% !important",
          width: "100% !important",
        },
      }}
    >
      <div
        className="tradingview-widget-copyright"
        style={{ display: "none" }}
      >
        <a
          href="https://www.tradingview.com/"
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="blue-text">
            Track all markets on TradingView
          </span>
        </a>
      </div>
    </Box>
  );
};

export default memo(TradingViewWidget);
