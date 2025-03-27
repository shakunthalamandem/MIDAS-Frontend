import { useEffect, useState } from "react";
interface NewsArticle {
  title: string;
  ticker: string;
  date: string;
  summary: string;
  sentiment: string;
}
const StockTickerNews = () => {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTicker, setSearchTicker] = useState("");
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [allNews, setAllNews] = useState<NewsArticle[]>([]); // Stores all news articles
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("http://192.168.1.40:9000/all_summary/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Token 3be8cd3188abc2b23fb55ba4b3fb015d0d4d5bf5", // Use your actual token
          },
        });
        const data = await response.json();
        console.log('Fetched News Data:', data);
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch news");
        }
        // Set both allNews and filteredNews initially to the fetched data
        setAllNews(data.news);
        setFilteredNews(data.news); // Initially display all the news
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);
  // Update filtered news based on searchTicker
  useEffect(() => {
    if (searchTicker === '') {
      setFilteredNews(allNews); // Show all news when searchTicker is empty
    } else {
      const filtered = allNews.filter(news =>
        news.ticker.toLowerCase().includes(searchTicker.toLowerCase()) // Case-insensitive filter
      );
      setFilteredNews(filtered); // Set filtered news
    }
  }, [searchTicker, allNews]); // Re-run whenever searchTicker or allNews changes
  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", marginBottom: "20px" }}>
        Latest News Summaries
      </h2>
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by Ticker (e.g., AAPL)"
        value={searchTicker}
        onChange={(e) => setSearchTicker(e.target.value)} // Handle search input
        style={{
          width: "40%",
          padding: "10px",
          fontSize: "16px",
          marginBottom: "15px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          alignContent: "center",
          marginLeft: "25%",
        }}
      />
      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}
      {/* News Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
        {filteredNews.length > 0 ? (
          filteredNews.map((news, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "white",
                borderRadius: "20px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                transition: "all 0.3s ease-in-out",
                cursor: "pointer",
                transform: "scale(1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.2)";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <p style={{ fontSize: "16px", color: "#666", margin: "5px 0" }}>
                Ticker: <strong>{news.ticker}</strong>
              </p>
              <h3 style={{ fontSize: "18px", color: "#0D47A1", fontWeight: "bold", margin: 0 }}>
                {news.title}
              </h3>
              <p style={{ fontSize: "14px", color: "#666", margin: "5px 0" }}>
                Posted on : <strong>{news.date}</strong>
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "#444",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {news.summary}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontWeight: "bold",
                    color:
                      news.sentiment === "Positive"
                        ? "green"
                        : news.sentiment === "Negative"
                        ? "red"
                        : "orange",
                  }}
                >
                  {news.sentiment}
                </span>
                <a href={`https://www.google.com/search?q=${news.title}`} target="_blank" rel="noopener noreferrer">
                  <button
                    style={{
                      backgroundColor: "#007BFF",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "5px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "bold",
                      transition: "0.3s",
                    }}
                  >
                    Read More
                  </button>
                </a>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#666", marginTop: "10px" }}>No news available.</p>
        )}
      </div>
    </div>
  );
};
export default StockTickerNews;