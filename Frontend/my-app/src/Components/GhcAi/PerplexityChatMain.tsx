import React, { useState } from "react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const PerplexityChatMain: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const updatedMessages = [...messages, { role: "user", content: input }];
    // setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/perplexity_chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          question: input,
          history: updatedMessages,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content: `Error: ${data.error || "Unknown error."}`,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `Failed to connect to backend.`,
        },
      ]);
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
      <h2>GenAI Chat</h2>

      <div
        style={{
          height: 400,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 10,
          marginBottom: 16,
          borderRadius: 8,
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              marginBottom: 12,
            }}
          >
            <strong>{msg.role.toUpperCase()}:</strong> {msg.content}
          </div>
        ))}
        {loading && <div>Assistant is typing...</div>}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={input}
          placeholder="Ask your question..."
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default PerplexityChatMain;
