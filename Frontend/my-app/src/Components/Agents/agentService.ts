import { AIAgent, CreateAgentPayload } from "./types";

const apiUrl = process.env.REACT_APP_API_URL;

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

/** List all agents (system + user's own) with email prefs and latest runs */
export async function fetchAgents(): Promise<AIAgent[]> {
  const res = await fetch(`${apiUrl}/api/v2/agents/`, {
    headers: authHeaders(),
  });
  return handleResponse<AIAgent[]>(res);
}

/** Create a new user agent */
export async function createAgent(payload: CreateAgentPayload): Promise<AIAgent> {
  const res = await fetch(`${apiUrl}/api/v2/agents/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<AIAgent>(res);
}

/** Update an existing agent */
export async function updateAgent(id: number, payload: Partial<CreateAgentPayload>): Promise<AIAgent> {
  const res = await fetch(`${apiUrl}/api/v2/agents/${id}/`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<AIAgent>(res);
}

/** Delete a user-created agent */
export async function deleteAgent(id: number): Promise<void> {
  const res = await fetch(`${apiUrl}/api/v2/agents/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Delete failed");
  }
}

/** Trigger immediate agent run */
export async function runAgent(id: number): Promise<{ message: string; output_id: number; status: string }> {
  const res = await fetch(`${apiUrl}/api/v2/agents/${id}/run/`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/** Toggle email preference for an agent */
export async function toggleEmailPreference(agentId: number, enabled: boolean): Promise<void> {
  const res = await fetch(`${apiUrl}/api/v2/agents/${agentId}/email-preference/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email_enabled: enabled }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to update email preference");
  }
}
