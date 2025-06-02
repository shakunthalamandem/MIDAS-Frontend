import React, { useEffect, useState } from "react";

interface FormData {
  ticker_symbol: string;
  pricing_date: string;
  deal_type: string;
  region: string;
  target_variable: string;
  sponsor: string;
  deal_size_million: number;
  selected_bank: string;
  percentage_primary: number;
  sector: string;
  discount_announcement_price: number;
  allocation_percentage_of_deal: number;
  allocation_percentage_of_ioi: number;
  gdp_growth: string;
  inflation_rate: string;
  treasury_rates: string;
  main_model_predicted: string;
  positive_model_predicted: boolean;
  negative_model_predicted: boolean;
  main_model_actual: string | null;
  positive_model_actual: string | null;
  negative_model_actual: string | null;
}

interface ApiResponse {
  data: FormData[];
}

interface RandomInfoPanelProps {
  onSelect: (formData: FormData) => void; // Add the onSelect prop type
}

const RandomInfoPanel: React.FC<RandomInfoPanelProps> = ({ onSelect }) => {
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<FormData | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://192.168.1.23:9000/api/predicted_forms/");

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const json: ApiResponse = await response.json();

        const sorted = json.data.sort(
          (a, b) => new Date(b.pricing_date).getTime() - new Date(a.pricing_date).getTime()
        );

        setForms(sorted.slice(0, 3)); // Only show the top 3 most recent forms
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p>Loading last submitted forms...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (forms.length === 0) return <p>No submitted forms found.</p>;

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 16px" }}>
      <h2 style={{ textAlign: "center", marginBottom: 24, color: "#333", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        Last Submitted Forms
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {forms.map((form, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              padding: 20,
              transition: "transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
              cursor: "pointer",
            }}
            onClick={() => {
              setSelectedForm(form);
              onSelect(form); // Trigger the passed onSelect function when a form is clicked
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.transform = "translateY(-6px)";
              el.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
            }}
          >
            <h3 style={{ marginTop: 0, color: "#0070f3", fontWeight: "600" }}>
              {form.ticker_symbol.toUpperCase()}{" "}
              <span style={{ fontWeight: "400", color: "#555" }}>— {form.pricing_date}</span>
            </h3>
            <p><strong>Deal Type:</strong> {form.deal_type}</p>
            <p><strong>Region:</strong> {form.region}</p>
          </div>
        ))}
      </div>

      {selectedForm && (
        <div
          style={{
            marginTop: 40,
            padding: 20,
            backgroundColor: "#f9f9f9",
            borderRadius: 10,
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
        
        </div>
      )}
    </div>
  );
}

export default RandomInfoPanel;
