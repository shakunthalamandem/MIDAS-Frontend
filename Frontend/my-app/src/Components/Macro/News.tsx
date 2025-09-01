import { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Pagination,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
interface NewsArticle {
  id: number;
  title: string;
  ticker: string;
  date: string;
  ai_summary: string;
  sentiment: string;
  source_url: string;
}

const StockTickerNews = () => {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTicker, setSearchTicker] = useState("");
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [allNews, setAllNews] = useState<NewsArticle[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        if (!response.ok) throw new Error(data.error || "Failed to fetch news");

        const newsData = data.portfolio_data?.news_data || [];
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

  useEffect(() => {
    if (searchTicker === "") {
      setFilteredNews(allNews);
    } else {
      const filtered = allNews.filter((news) =>
        news.ticker.toLowerCase().includes(searchTicker.toLowerCase())
      );
      setFilteredNews(filtered);
    }
    setCurrentPage(1);
  }, [searchTicker, allNews]);

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "green";
      case "Negative":
        return "red";
      default:
        return "orange";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" fontWeight="bold" mb={4}>
        Latest News Summaries
      </Typography>

      <TextField
        label="Search by Ticker (e.g., AAPL)"
        variant="outlined"
        value={searchTicker}
        onChange={(e) => setSearchTicker(e.target.value)}
        fullWidth
        sx={{ mb: 4 }}
      />

      {loading && (
        <Typography align="center">Fetching the latest stock news...</Typography>
      )}
      {error && (
        <Typography align="center" color="error">
          Oops! Something went wrong. {error}
        </Typography>
      )}

      <Grid container spacing={3}>
        {paginatedNews.map((news) => (
          <Grid item xs={12} key={news.id}>
            <Card
              elevation={3}
              sx={{
                position: "relative",
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.02)" },
              }}
            >
              <CardContent sx={{ pb: 6, pr: 10 }}>
                {/* Top right corner sentiment + date */}
                <Box sx={{ position: "absolute", top: 16, right: 16, textAlign: "right" }}>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={getSentimentColor(news.sentiment)}
                  >
                    {news.sentiment}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formatDate(news.date)}
                  </Typography>
                </Box>

                <Typography variant="h6" color="primary" gutterBottom>
                  <ReactMarkdown>{news.title}</ReactMarkdown>
                </Typography>

                {news.ai_summary && (
                  <Box
                    sx={{
                      backgroundColor: "#f5f5f5",
                      borderRadius: 2,
                      p: 2,
                      mt: 1,
                    }}
                  >
                    <Typography fontWeight="bold" color="textPrimary">
                      🤖 AI Summary:
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      <ReactMarkdown>{news.ai_summary}</ReactMarkdown>
                    </Typography>
                  </Box>
                )}

                {/* Bottom row with ticker left and button right */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 2,
                    bottom: 16,
                    left: 16,
                    right: 16,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#333" }}>
                    The above news is related to{" "}
                    <Box component="span" sx={{ color: "#1976d2", fontWeight: "bold" }}>
                      {news.ticker} US
                    </Box>
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    href={news.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read More
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {paginatedNews.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default StockTickerNews;
