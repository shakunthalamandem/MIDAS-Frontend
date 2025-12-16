import React, { useState } from "react";

type Source = { title: string; url: string; score?: number };
type ChatResponse = { answer: string; sources: Source[] };

export default function MidasChatbotData() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chatbot_query/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      const data: ChatResponse = await res.json();
      setAnswer(data.answer || "");
      setSources(data.sources || []);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
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
          onKeyDown={(e) => e.key === "Enter" && ask()}
        />
        <button style={styles.button} onClick={ask} disabled={loading}>
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
              {sources.map((s) => (
                <a key={s.url + s.title} href={s.url} style={styles.link}>
                  {s.title} {typeof s.score === "number" ? `(${s.score.toFixed(2)})` : ""}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
