import React, { useState } from "react";
import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";

type FormState = {
  page_id: string;
  url: string;
  title: string;
  body: string;
};

const MidasChatbotIndexer: React.FC = () => {
  const [form, setForm] = useState<FormState>({ page_id: "", url: "", title: "", body: "" });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const submit = async () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    if (!apiUrl) {
      setError("API URL is not defined in environment variables");
      return;
    }

    const payload = {
      page_id: form.page_id.trim(),
      url: form.url.trim(),
      title: form.title.trim(),
      body: form.body.trim(),
    };

    const hasFile = !!file;
    const hasBody = !!payload.body;

    if (!hasFile && !hasBody) {
      setError("Provide page text in Body or upload a file.");
      return;
    }

    if (!hasFile && (!payload.page_id || !payload.url || !payload.title)) {
      setError("page_id, url, and title are required when no file is uploaded.");
      return;
    }

    const token = localStorage.getItem("access_token");
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      if (payload.page_id) formData.append("page_id", payload.page_id);
      if (payload.url) formData.append("url", payload.url);
      if (payload.title) formData.append("title", payload.title);
      if (payload.body) formData.append("body", payload.body);
      if (file) formData.append("file", file);

      const res = await fetch(`${apiUrl}/api/chatbot_index/`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || data?.error || "Failed to index page");
      }

      setSuccess(`Indexed ${data?.indexed_chunks ?? 0} chunks`);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" fontWeight={600} color="#002060" gutterBottom>
        Train / Index Site Content
      </Typography>
      <Stack spacing={2}>
        <TextField label="Page ID" value={form.page_id} onChange={handleChange("page_id")} fullWidth size="small" />
        <TextField label="URL" value={form.url} onChange={handleChange("url")} fullWidth size="small" />
        <TextField label="Title" value={form.title} onChange={handleChange("title")} fullWidth size="small" />
        <TextField
          label="Body"
          value={form.body}
          onChange={handleChange("body")}
          fullWidth
          multiline
          minRows={6}
          placeholder="Paste the full page text to index"
        />
        <Button
          variant="outlined"
          component="label"
          disabled={loading}
        >
          {file ? `Selected: ${file.name}` : "Upload file (pdf/docx/txt)"}
          <input
            type="file"
            hidden
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </Button>

        <Button variant="contained" onClick={submit} disabled={loading}>
          {loading ? "Indexing..." : "Index Page"}
        </Button>
        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Paper>
  );
};

export default MidasChatbotIndexer;
