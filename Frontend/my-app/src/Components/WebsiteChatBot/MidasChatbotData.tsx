import React, { useState } from "react";

type Source = { title: string; url: string; score?: number };
type ChatResponse = { answer: string; sources: Source[] };

const MidasChatbotData: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async () => {
    if (!question.trim() || loading) return;

    const apiUrl = process.env.REACT_APP_API_URL;
    if (!apiUrl) {
      setError("API URL is not defined in environment variables");
      return;
    }

    const token = localStorage.getItem("access_token");

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiUrl}/api/chatbot_query/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!res.ok) {
        // try to read a helpful error payload (optional)
        let detail = "";
        try {
          const errJson = await res.json();
          detail = errJson?.detail ? ` - ${errJson.detail}` : "";
        } catch {
          // ignore json parse failures
        }
        throw new Error(`Request failed: ${res.status}${detail}`);
      }

      const data: ChatResponse = await res.json();
      setAnswer(data?.answer ?? "");
      setSources(Array.isArray(data?.sources) ? data.sources : []);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
      setAnswer("");
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.shell}>
      <h3 style={styles.title}>Site Chatbot</h3>

      <div style={styles.row}>
        <input
          style={styles.input}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about this site..."
          onKeyDown={(e) => {
            if (e.key === "Enter") ask();
          }}
          disabled={loading}
        />

        <button style={styles.button} onClick={ask} disabled={loading || !question.trim()}>
          {loading ? "Asking..." : "Ask"}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {answer && (
        <div style={styles.answerBox}>
          <pre style={styles.answer}>{answer}</pre>

          {sources.length > 0 && (
            <div style={styles.sources}>
              <div style={styles.sourcesLabel}>Sources</div>

              {sources.map((s, idx) => (
                <a
                  key={`${s.url}-${s.title}-${idx}`}
                  href={s.url}
                  style={styles.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  {s.title}{" "}
                  {typeof s.score === "number" ? `(${s.score.toFixed(2)})` : ""}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MidasChatbotData;

export const styles: Record<string, React.CSSProperties> = {
  shell: { maxWidth: 640, padding: 16, border: "1px solid #ddd", borderRadius: 8 },
  title: { margin: "0 0 12px 0", fontSize: 18 },
  row: { display: "flex", gap: 8, marginBottom: 12 },
  input: { flex: 1, padding: "10px 12px", border: "1px solid #ccc", borderRadius: 6 },
  button: { padding: "0 16px", borderRadius: 6, border: "1px solid #111", background: "#111", color: "#fff" },
  answerBox: { padding: 12, border: "1px solid #eee", borderRadius: 8, background: "#fafafa" },
  answer: { margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit" },
  sources: { marginTop: 10, display: "flex", flexDirection: "column", gap: 4 },
  sourcesLabel: { fontWeight: 600, fontSize: 13 },
  link: { color: "#0a66c2", textDecoration: "none" },
  error: { color: "#b00020", marginBottom: 8 },
};
