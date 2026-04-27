import axios from "axios";
import env from "../../env";
import type {
  OpenClawHistoryResponse,
  OpenClawStreamCallbacks,
  OpenClawConversationsResponse,
} from "./openclawTypes";

const ACCESS_KEY = "access_token";
const BASE = () => env.apiUrl || (process.env.REACT_APP_API_URL as string) || "";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(ACCESS_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchOpenClawHistory(salt?: string): Promise<OpenClawHistoryResponse> {
  const qs = salt !== undefined ? `?salt=${encodeURIComponent(salt)}` : "";
  const r = await axios.get<OpenClawHistoryResponse>(
    `${BASE()}/api/openclaw_chat/history/${qs}`,
    { headers: authHeaders() }
  );
  return r.data;
}

export async function resetOpenClawChat(): Promise<{ ok: boolean; session_salt: string }> {
  const r = await axios.post<{ ok: boolean; session_salt: string }>(
    `${BASE()}/api/openclaw_chat/reset/`,
    {},
    { headers: authHeaders() }
  );
  return r.data;
}

export async function fetchOpenClawConversations(): Promise<OpenClawConversationsResponse> {
  const r = await axios.get<OpenClawConversationsResponse>(
    `${BASE()}/api/openclaw_chat/conversations/`,
    { headers: authHeaders() }
  );
  return r.data;
}

export async function resumeOpenClawChat(salt: string): Promise<{ ok: boolean; session_salt: string }> {
  const r = await axios.post<{ ok: boolean; session_salt: string }>(
    `${BASE()}/api/openclaw_chat/resume/`,
    { session_salt: salt },
    { headers: authHeaders() }
  );
  return r.data;
}

/**
 * Stream an OpenClaw reply over SSE. Uses fetch + ReadableStream because
 * axios cannot stream response bodies in the browser.
 */
export async function streamOpenClawChat(
  message: string,
  cb: OpenClawStreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  try {
    const resp = await fetch(`${BASE()}/api/openclaw_chat/`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
      signal,
    });

    if (!resp.ok || !resp.body) {
      let errText = "";
      try {
        errText = await resp.text();
      } catch {
        errText = `HTTP ${resp.status}`;
      }
      cb.onError(errText || `HTTP ${resp.status}`);
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    // SSE frames are separated by a blank line. We may also receive bare
    // "data:" lines at any point; parse whenever a full frame is buffered.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const rawFrame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        parseFrame(rawFrame, cb);
      }
    }
    // Flush any trailing frame
    if (buffer.trim()) parseFrame(buffer, cb);
    cb.onDone();
  } catch (e: any) {
    if (e && e.name === "AbortError") {
      cb.onDone();
      return;
    }
    cb.onError(e?.message || String(e));
  }
}

function parseFrame(frame: string, cb: OpenClawStreamCallbacks) {
  // A frame is one or more lines. We only care about "data:" lines.
  const lines = frame.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;
    const payload = trimmed.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      const parsed = JSON.parse(payload);
      const choices = parsed.choices || [];
      const delta =
        choices[0]?.delta?.content ??
        choices[0]?.message?.content ??
        "";
      if (delta) cb.onChunk(delta);
    } catch {
      // ignore malformed chunks / keep-alives
    }
  }
}
