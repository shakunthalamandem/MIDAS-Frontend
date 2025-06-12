import React, { useEffect, useState } from "react";
import FinancialForecastTable from "./IPOFinancialTableMain";
import IPODashboardMain from "./IPODashboardMain";

const cardStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    padding: 20,
    minHeight: 320,
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
};

const cardsContainer: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "50% 50%",
    gridTemplateRows: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 24,
    width: "100%",
};

const fullWidthStyle: React.CSSProperties = {
    gridColumn: "1 / span 2",
    width: "100%",
    marginBottom: 24,
};

const infoTableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    margin: "24px 0",
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    overflow: "hidden",
};

const infoHeaderCell: React.CSSProperties = {
    background: "#f5f6fa",
    fontWeight: 600,
    padding: "12px 10px",
    borderBottom: "1px solid #e0e0e0",
    textAlign: "center",
    fontSize: 15,
    color: "#002060",
};

const infoCell: React.CSSProperties = {
    padding: "12px 10px",
    borderBottom: "1px solid #e0e0e0",
    textAlign: "center",
    fontSize: 15,
    color: "#222",
};

const formatPriceRange = (lower: number | null, upper: number | null) => {
    if (lower && upper) return `$${lower} - $${upper}`;
    if (lower) return `$${lower}`;
    if (upper) return `$${upper}`;
    return "N/A";
};

const IPODashboardAll: React.FC = () => {
    const [ipoData, setIpoData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                const token = localStorage.getItem("access_token");

                if (!apiUrl) {
                    throw new Error("API URL is not defined in environment variables");
                }

                const response = await fetch(`${apiUrl}/api/writeup_data/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                    body: JSON.stringify({ ticker: "CRWV" }),
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || `HTTP error! status: ${response.status}`);
                }

                const jsonData = await response.json();
                setIpoData(jsonData);
            } catch (err: any) {
                console.error("Failed to fetch IPO data", err);
                setError("Failed to fetch IPO data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    return (
        <div style={{ marginLeft: 16, marginRight: 16 }}>
            {ipoData && (
                <>
                    <h2>
                        {ipoData.company_name} ({ipoData.ticker_name} | {ipoData.exchange})
                    </h2>
                    {/* Info Table */}
                    <table style={infoTableStyle}>
                        <thead>
                            <tr>
                                <th style={infoHeaderCell}>Pricing Date</th>
                                <th style={infoHeaderCell}>Price Range</th>
                                <th style={infoHeaderCell}>Deal Size</th>
                                <th style={infoHeaderCell}>Industry</th>
                                <th style={infoHeaderCell}>Shares Offered</th>
                                <th style={infoHeaderCell}>No. Shares Out (NoSH)</th>
                                <th style={infoHeaderCell}>Established</th>
                                <th style={infoHeaderCell}>Bookrunners</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={infoCell}>{ipoData.pricing_date || "N/A"}</td>
                                <td style={infoCell}>
                                    {formatPriceRange(ipoData.lower_bound, ipoData.upper_bound)}
                                </td>
                                <td style={infoCell}>
                                    {ipoData.deal_size ? `$${ipoData.deal_size.toLocaleString()}` : "N/A"}
                                </td>
                                <td style={infoCell}>{ipoData.industry || "N/A"}</td>
                                <td style={infoCell}>
                                    {ipoData.shares_offered ? ipoData.shares_offered.toLocaleString() : "N/A"}
                                </td>
                                <td style={infoCell}>
                                    {ipoData.nosh ? ipoData.nosh.toLocaleString() : "N/A"}
                                </td>
                                <td style={infoCell}>{ipoData.established_year || "N/A"}</td>
                                <td style={infoCell}>
                                    {ipoData.bookrunners ? ipoData.bookrunners.join(", ") : "N/A"}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div style={cardsContainer}>
                        <div style={cardStyle}>
                            <h3 style={{ color: "#002060", marginBottom: 12 }}>Business Overview</h3>
                            <ul style={{ paddingLeft: 18 }}>
                                {ipoData.business_overview?.map((item: string, idx: number) => (
                                    <li key={idx} style={{ marginBottom: 8 }}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div style={cardStyle}>
                            <h3 style={{ color: "#002060", marginBottom: 12 }}>Key Highlights</h3>
                            <ul style={{ paddingLeft: 18 }}>
                                {ipoData.key_highlights?.map((item: string, idx: number) => (
                                    <li key={idx} style={{ marginBottom: 8 }}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div style={cardStyle}>
                            <h3 style={{ color: "#002060", marginBottom: 12 }}>Strengths</h3>
                            <ul style={{ paddingLeft: 18 }}>
                                {ipoData.strengths?.map((item: string, idx: number) => (
                                    <li key={idx} style={{ marginBottom: 8 }}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div style={cardStyle}>
                            <h3 style={{ color: "#002060", marginBottom: 12 }}>Concerns</h3>
                            <ul style={{ paddingLeft: 18 }}>
                                {ipoData.concerns?.map((item: string, idx: number) => (
                                    <li key={idx} style={{ marginBottom: 8 }}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div style={cardStyle}>
                            <h3 style={{ color: "#002060", marginBottom: 12 }}>Principal Stockholders (pre-IPO)</h3>
                            <ul style={{ paddingLeft: 18 }}>
                                {ipoData.principal_stockholders_preipo?.map((item: string, idx: number) => (
                                    <li key={idx} style={{ marginBottom: 8 }}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div style={cardStyle}>
                            <h3 style={{ color: "#002060", marginBottom: 12 }}>Key Management Personnel</h3>
                            <ul style={{ paddingLeft: 18 }}>
                                {ipoData.key_management_personnel?.map((item: string, idx: number) => (
                                    <li key={idx} style={{ marginBottom: 8 }}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        {/* Financial Table Full Width */}
                        <div style={fullWidthStyle}>
                            <FinancialForecastTable defaultTicker="CRWV" />
                        </div>
                        {/* IPODashboardMain Full Width */}
                        <div style={fullWidthStyle}>
                            <IPODashboardMain />
                        </div>
                    </div>
                </>
            )}
            {/* <pre>{JSON.stringify(ipoData, null, 2)}</pre> */}
        </div>
    );
};

export default IPODashboardAll;