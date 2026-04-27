export type OpenClawRole = "user" | "assistant";

export interface OpenClawMessage {
  id?: number;
  role: OpenClawRole;
  content: string;
  error?: boolean;
  created_at?: string;
  // client-only flags
  pending?: boolean;
  streaming?: boolean;
}

export interface OpenClawHistoryResponse {
  session_salt: string;
  is_current?: boolean;
  messages: OpenClawMessage[];
}

export interface OpenClawConversationSummary {
  session_salt: string;
  is_current: boolean;
  message_count: number;
  started_at: string | null;
  last_at: string | null;
  preview: string;
}

export interface OpenClawConversationsResponse {
  current_salt: string;
  conversations: OpenClawConversationSummary[];
}

export interface OpenClawStreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}
