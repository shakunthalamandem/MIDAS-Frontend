import React from "react";
import StockHeatmapTreemap from "./StockHeatmapTreemap";

const sampleData = {
  heat_value: [
    // Technology
    {
      stock_name: "Apple Inc.",
      sector: "Technology",
      region: "North America",
      country: "USA",
      news_positivity: 65,
      confidence: 91.2,
    },
    {
      stock_name: "Microsoft Corp",
      sector: "Technology",
      region: "North America",
      country: "USA",
      news_positivity: 40,
      confidence: 87.6,
    },
    {
      stock_name: "Meta Platforms",
      sector: "Technology",
      region: "North America",
      country: "USA",
      news_positivity: 30,
      confidence: 82.1,
    },

    // Consumer Discretionary
    {
      stock_name: "Amazon.com Inc.",
      sector: "Consumer Discretionary",
      region: "North America",
      country: "USA",
      news_positivity: 12,
      confidence: 79.1,
    },
    {
      stock_name: "Nike Inc.",
      sector: "Consumer Discretionary",
      region: "North America",
      country: "USA",
      news_positivity: -10,
      confidence: 68.5,
    },

    // Automobiles
    {
      stock_name: "Tesla Inc.",
      sector: "Automobiles",
      region: "North America",
      country: "USA",
      news_positivity: -55,
      confidence: 93.3,
    },
    {
      stock_name: "Ford Motor Co.",
      sector: "Automobiles",
      region: "North America",
      country: "USA",
      news_positivity: -25,
      confidence: 70.8,
    },

    // Semiconductors
    {
      stock_name: "Nvidia Corp",
      sector: "Semiconductors",
      region: "North America",
      country: "USA",
      news_positivity: 88,
      confidence: 96.1,
    },
    {
      stock_name: "Intel Corp",
      sector: "Semiconductors",
      region: "North America",
      country: "USA",
      news_positivity: 45,
      confidence: 84.9,
    },

    // Financials
    {
      stock_name: "JPMorgan Chase",
      sector: "Financials",
      region: "North America",
      country: "USA",
      news_positivity: 22,
      confidence: 81.3,
    },
    {
      stock_name: "Goldman Sachs",
      sector: "Financials",
      region: "North America",
      country: "USA",
      news_positivity: 5,
      confidence: 77.4,
    },
  ],
};

export default function HeatMapMain() {
  return <StockHeatmapTreemap data={sampleData.heat_value} />;
}
