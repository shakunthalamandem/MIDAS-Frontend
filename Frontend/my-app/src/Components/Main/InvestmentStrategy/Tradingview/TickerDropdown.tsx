import React, { useState, useEffect } from "react";
import axios from "axios";
import FundamentalMetricsCard from "../Tabs/FundamentalMetricsCard";

// Define the type for the API response
interface Ticker {
  id: number;
  ticker: string;
}

const TickerDropdown: React.FC = () => {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string>("");

  useEffect(() => {
    // Fetch tickers from API
    const fetchTickers = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;

        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        // Fetch data with type annotation for Axios response
        const response = await axios.get<Ticker[]>(`${apiUrl}/populate-invested-tickers/`);
        setTickers(response.data);
      } catch (error) {
        console.error("Error fetching tickers:", error);
      }
    };

    fetchTickers();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <div>
        <label htmlFor="ticker-dropdown" style={{ fontSize: "18px", marginRight: "10px" }}>
          Select a Ticker:
        </label>
        <select
          id="ticker-dropdown"
          style={{ fontSize: "16px", padding: "5px" }}
          value={selectedTicker}
          onChange={(e) => setSelectedTicker(e.target.value)}
        >
          <option value="" disabled>
            -- Choose a Ticker --
          </option>
          {tickers.map((ticker) => (
            <option key={ticker.id} value={ticker.ticker}>
              {ticker.ticker}
            </option>
          ))}
        </select>
      </div>

      {selectedTicker && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            display: "inline-block",
            backgroundColor: "#f9f9f9",
            fontSize: "20px",
          }}
        >
          Selected Ticker: <strong>{selectedTicker}</strong>
          <FundamentalMetricsCard ticker={selectedTicker} />
        </div>
        
      )}
    </div>
  );
};

export default TickerDropdown;
