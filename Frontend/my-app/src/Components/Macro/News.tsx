import { useEffect, useState } from "react";

interface NewsArticle {
  title: string;
  ticker: string;
  date: string;
  summary: string;
  sentiment: string;
  url: string;
}

const StockTickerNews = () => {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTicker, setSearchTicker] = useState("");
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [allNews, setAllNews] = useState<NewsArticle[]>([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of news per page
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/fetch_news/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        console.log("Fetched News Data:", data);

        if (!response.ok) throw new Error(data.error || "Failed to fetch news");

        const newsData = data.portfolio_data?.news || [];
        setAllNews(newsData);
        setFilteredNews(newsData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Filter news based on search input
  useEffect(() => {
    if (searchTicker === "") {
      setFilteredNews(allNews);
    } else {
      const filtered = allNews.filter((news) =>
        news.ticker.toLowerCase().includes(searchTicker.toLowerCase())
      );
      setFilteredNews(filtered);
    }
    setCurrentPage(1); // Reset to first page on search
  }, [searchTicker, allNews]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]); // Runs every time currentPage updates

  // Pagination logic
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNews = filteredNews.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "auto" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", marginBottom: "20px" }}>
        Latest News Summaries
      </h2>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by Ticker (e.g., AAPL)"
        value={searchTicker}
        onChange={(e) => setSearchTicker(e.target.value)}
        style={{
          width: "40%",
          padding: "10px",
          fontSize: "16px",
          marginBottom: "15px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />

      {loading && <p style={{ textAlign: "center" }}>Fetching the latest stock news...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>Oops! Something went wrong. {error}</p>}

      {/* News Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
        {paginatedNews.length > 0 ? (
          paginatedNews.map((news, index) => (
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
              <h3 style={{ fontSize: "18px", color: "#0d47a1", fontWeight: "bold", margin: 0 }}>
                {news.title}
              </h3>
              <p style={{ fontSize: "14px", color: "#666", margin: "5px 0" }}>
                Posted on : <strong>{news.date}</strong>
              </p>
              <p style={{ fontSize: "15px", color: "#444", overflow: "hidden", textOverflow: "ellipsis" }}>
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
                <a href={news.url} target="_blank" rel="noopener noreferrer">
                  <button
                    style={{
                      backgroundColor: "#007bff",
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

      {/* Pagination Controls */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", gap: "5px" }}>
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: "8px 12px",
            fontSize: "14px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: currentPage === 1 ? "#ccc" : "#007bff",
            color: "white",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
          }}
        >
          {"<"}
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            style={{
              padding: "8px 12px",
              fontSize: "14px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: currentPage === index + 1 ? "#007bff" : "",
              color: "black",
              cursor: "pointer",
            }}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: "8px 12px",
            fontSize: "14px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: currentPage === totalPages ? "#ccc" : "#007bff",
            color: "white",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          }}
        >
          {">"}
        </button>
      </div>
    </div>
  );
};

export default StockTickerNews;
