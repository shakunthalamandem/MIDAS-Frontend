import React, { useEffect, useRef, memo } from "react";
import { Card, Box } from "@mui/material";

interface TradingViewWidgetProps {
  ticker: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ ticker }) => {
  const cleanedTicker = ticker.replace(/\s+US$/, "");
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!container.current) {
      console.error("Container reference is null.");
      return;
    }

    // Clean up any existing widget before loading a new one
    container.current.innerHTML = `
      <div class="tradingview-widget-container__widget"></div>
    `;

    setTimeout(() => {
      if (!container.current) return; // Additional null check

      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "width": "1200",
          "height": "500",
          "symbol": "${cleanedTicker}",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "light",
          "style": "1",
          "locale": "en",
          "allow_symbol_change": true,
          "calendar": false,
          "withdateranges":true,
          "support_host": "https://www.tradingview.com"
        }
      `;
      container.current
        .querySelector(".tradingview-widget-container__widget")
        ?.appendChild(script);
    }, 100); // Delay for 100ms

    // Cleanup on unmount
    return () => {
      if (container.current) {
        container.current.innerHTML = ""; // Clear the widget container
      }
    };
  }, [cleanedTicker]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" padding={3}>
      <Card
        sx={{
          width: "100%",
          maxWidth: 1200,
          borderRadius: 2,
          boxShadow: 3, // MUI shadow level
          overflow: "hidden",
        }}
      >
        <Box
          ref={container}
          className="tradingview-widget-container"
          sx={{
            height: 500, // Fixed height
            width: "100%",
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
      </Card>
    </Box>
  );
};

export default memo(TradingViewWidget);
