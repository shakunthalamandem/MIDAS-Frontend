import React, { useEffect, useRef, memo } from "react";
import { Card, Box } from "@mui/material";

const TradingViewWidget: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "width": "12  00",
        "height": "500",        
        "symbol": "CIVI",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "light",
        "style": "1",
        "locale": "en",
        "allow_symbol_change": true,
        "calendar": false,
        "support_host": "https://www.tradingview.com"
      }
    `;
    container.current.appendChild(script);

    // Cleanup to remove the script on unmount
    return () => {
      if (container.current) {
        container.current.innerHTML = ""; // Clear the widget container
      }
    };
  }, []);

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
            height: 800, // Fixed height
            width: "100%",
          }}
        >
          <div
            className="tradingview-widget-container__widget"
            style={{
              height: "calc(600px - 32px)", // Adjusted height
              width: "100%",
            }}
          ></div>
          <div className="tradingview-widget-copyright">
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
