import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  CircularProgress,
  Paper,
  Typography,
  TextField,
  Alert,
  Divider,
  InputAdornment,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type ApiResponse = {
  answer: string;
};
const SYSTEM_VIS_PROMPT = `
You are a financial data analyst assistant. Your job is to provide clear, clean responses that include executable JavaScript-ready code or directly plottable Chart.js compatible JSON data.

Rules for data presentation:

- If the user requests analysis or visualization, include chart data inside a single markdown code block with tag \`chartjs\`, exactly like this:

\`\`\`chartjs
{
  "type": "bar",
  "data": {...},
  "options": {...}
}
\`\`\`

- Provide a concise, human-readable summary or explanation before the code block, separated by a blank line.

- Do not add extra backticks, stars (**), or any markdown characters inside or around the code block.

- Only include **one** chartjs block per response if relevant.

- For non-chart data, use \`\`\`json\n{ ... }\n\`\`\`.

- The summary must be clear, brief, and separate from the code block by an empty line for easy parsing.

Here is an example:

Summary:

- The chart below compares IPO price bands (min and max) for key companies from January to July 2025.

\`\`\`chartjs
{
  "type": "bar",
  "data": {...},
  "options": {...}
}
\`\`\`
`;

const extractChartJSBlock = (text: string): any | null => {
  const chartjsMatch = text.match(/``````/i);
  if (chartjsMatch && chartjsMatch[1]) {
    try {
      return JSON.parse(chartjsMatch[1]);
    } catch {
      return null;
    }
  }
  return null;
};

// Clean markdown artifacts like `````` and ** ** plus excess empty lines
// Also separate into sections for highlight — e.g. by headings (Summary, Risks, Recommendations)
const cleanAndParseAnswer = (raw: string) => {
  let cleaned = raw // Remove chartjs code block
    .replace(/``````/g, "") // Remove json code blocks if any
    .replace(/``````/g, "") // Remove bold ** or __
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1") // Remove leading/trailing whitespace on lines
    .split("\n")
    .map((line) => line.trim()) // Filter empty lines except one line gap max
    .filter(Boolean)
    .join("\n"); // Heuristic: Split by major headings (lines ending with colon or uppercase words)
  // This is basic, can be improved if more structured data comes

  const sections: { title?: string; content: string }[] = [];
  let currSection: { title?: string; content: string } = { content: "" };

  cleaned.split("\n").forEach((line) => {
    // Detect section titles heuristically
    if (
      /^(Summary|Risks|Analyst Sentiment|Conclusion|Recommendations|Key Details|Brokerage Opinion|Positive|Negative|Risks?):?$/i.test(
        line
      )
    ) {
      if (currSection.content) {
        sections.push(currSection);
      }
      currSection = { title: line.replace(/:$/, ""), content: "" };
    } else {
      currSection.content += line + "\n";
    }
  });
  if (currSection.content) {
    sections.push(currSection);
  }

  return sections;
};

const PerplexityChat: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [chartData, setChartData] = useState<any | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setApiError(null);
    setAnswer("");
    setChartData(null);

    try {
      const response = await fetch(`${apiUrl}/api/perplexity_chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: question.trim() + "\n\n" + SYSTEM_VIS_PROMPT,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);
      const data: ApiResponse = await response.json();

      setAnswer(data.answer);

      const extractedChart = extractChartJSBlock(data.answer);
      if (extractedChart) setChartData(extractedChart);
    } catch (e: any) {
      setApiError(e.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuestion("");
    setAnswer("");
    setChartData(null);
    setApiError(null);
  };

  const sections = cleanAndParseAnswer(answer); // Helper: render a section with optional title and content

  const renderSection = (
    section: { title?: string; content: string },
    idx: number
  ) => {
    const { title, content } = section;
    if (!title) {
      // Render plain content
      return (
        <Typography
          key={idx}
          variant="body1"
          sx={{
            whiteSpace: "pre-line",
            color: "#1e293b",
            mb: 2,
            fontSize: "1rem",
            lineHeight: 1.5,
          }}
        >
                    {content.trim()}       {" "}
        </Typography>
      );
    } // Color coding to help user quickly scan sections
    const titleColors: Record<string, string> = {
      Summary: "#059669",
      Risks: "#b45309",
      "Analyst Sentiment": "#2563eb",
      Conclusion: "#7c3aed",
      Recommendations: "#2563eb",
      "Key Details": "#065f46",
      "Brokerage Opinion": "#dc2626",
      Positive: "#059669",
      Negative: "#dc2626",
    };
    const color = titleColors[title] || "#334155";

    return (
      <Box key={idx} mb={3}>
               {" "}
        <Typography variant="h6" fontWeight={700} color={color} gutterBottom>
                    {title}       {" "}
        </Typography>
               {" "}
        <Typography
          variant="body1"
          sx={{ whiteSpace: "pre-line", color: "#1e293b", lineHeight: 1.5 }}
        >
                    {content.trim()}       {" "}
        </Typography>
             {" "}
      </Box>
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
           {" "}
      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)",
          boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
        }}
      >
               {" "}
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
          sx={{ color: "#112233", letterSpacing: 1.2 }}
        >
                    🎯 Ask Perplexity AI — Analyst Assistant        {" "}
        </Typography>
               {" "}
        <Typography
          variant="subtitle1"
          textAlign="center"
          sx={{ mb: 3, color: "#334155", maxWidth: 580, mx: "auto" }}
        >
                    Ask questions about financials, IPOs, or sector performance.
          Responses may include charts, tables, or summaries.        {" "}
        </Typography>
               {" "}
        <Box mb={2}>
                   {" "}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="e.g., Show me IPO performance by sector over last 6 months"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                                    <SearchIcon color="primary" />             
                   {" "}
                </InputAdornment>
              ),
              sx: { backgroundColor: "white", borderRadius: 2 },
            }}
          />
                 {" "}
        </Box>
               {" "}
        <Box display="flex" justifyContent="center" gap={2} mt={2}>
                   {" "}
          <Button
            variant="contained"
            color="primary"
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            sx={{
              px: 5,
              fontWeight: "600",
            }}
          >
                       {" "}
            {loading ? <CircularProgress size={22} color="inherit" /> : "Ask"} 
                   {" "}
          </Button>
                   {" "}
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClear}
            disabled={loading}
            sx={{ px: 4 }}
          >
                        Clear          {" "}
          </Button>
                 {" "}
        </Box>
             {" "}
      </Paper>
           {" "}
      {apiError && (
        <Alert severity="error" sx={{ mt: 4, fontWeight: "600" }}>
                    {apiError}       {" "}
        </Alert>
      )}
           {" "}
      {!loading && (answer || chartData) && (
        <Paper
          elevation={4}
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 3,
            backgroundColor: "#f9fafb",
            boxShadow: "0px 8px 20px rgba(0,0,0,0.05)",
          }}
        >
                   {" "}
          {chartData && (
            <>
                           {" "}
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "#0f172a", mb: 1, fontWeight: 700 }}
              >
                                📊 Visualized Data              {" "}
              </Typography>
                           {" "}
              <Box sx={{ mb: 3 }}>
                               {" "}
                <Bar
                  data={chartData.data}
                  options={{ responsive: true, maintainAspectRatio: false }}
                  style={{ maxHeight: 350 }}
                />
                             {" "}
              </Box>
                            <Divider sx={{ mb: 2 }} />           {" "}
            </>
          )}
                   {" "}
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#0f172a", mb: 2, fontWeight: 700 }}
          >
                        🧠 Perplexity Answer          {" "}
          </Typography>
                   {" "}
          <Box sx={{ maxHeight: 420, overflowY: "auto", pr: 1 }}>
                        {sections.map((sec, idx) => renderSection(sec, idx))}   
                 {" "}
          </Box>
                 {" "}
        </Paper>
      )}
         {" "}
    </Container>
  );
};

export default PerplexityChat;
