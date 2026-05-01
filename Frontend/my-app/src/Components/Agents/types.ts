export interface AIAgent {
  id: number;
  name: string;
  description: string;
  agent_type: "system" | "user_created";
  prompt?: string;
  final_prompt?: string;
  prompt_updated_at?: string | null;
  api_endpoint?: string;
  schedule_type: "daily" | "weekly" | "hourly" | "one_time" | "cron";
  schedule_value: string;
  is_active: boolean;
  use_web_search?: boolean;
  created_by?: number | null;
  created_by_email?: string | null;
  created_at: string;
  updated_at: string;
  // Enriched from API
  email_enabled?: boolean;
  latest_run?: string | null;
  latest_date?: string | null;
  output_status?: "pending" | "running" | "completed" | "failed" | null;
  latest_output_id?: number | null;
}

export type AgentOutputStatus = "pending" | "running" | "completed" | "failed";

export interface AgentOutputSection {
  title: string;
  type: "text" | "table" | "list";
  content?: string;
  headers?: string[];
  rows?: (string | number)[][];
  items?: string[];
}

export interface AgentOutputResultJSON {
  agent_id: number;
  agent_name: string;
  status: string;
  executed_at: string;
  summary: string;
  sections: AgentOutputSection[];
  metadata?: {
    data_sources?: string[];
    confidence?: "high" | "medium" | "low";
    analysis_date?: string;
    [key: string]: unknown;
  };
}

export interface AgentOutput {
  id: number;
  agent: number;
  agent_name: string;
  agent_prompt?: string;
  agent_final_prompt?: string;
  agent_description?: string;
  status: AgentOutputStatus;
  result_json: AgentOutputResultJSON | null;
  error_message: string;
  triggered_by: number | null;
  triggered_by_email: string | null;
  celery_task_id: string;
  created_at: string;
  completed_at: string | null;
}

export interface AgentEmailPreference {
  id: number;
  user: number;
  agent: number;
  agent_name: string;
  user_email: string;
  email_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAgentPayload {
  name: string;
  description: string;
  prompt: string;
  schedule_type: AIAgent["schedule_type"];
  schedule_value: string;
  use_web_search?: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  response: string;
}

// Route map for system agents (preserved from existing routes)
export const SYSTEM_AGENT_ROUTES: Record<string, string> = {
  "Portfolio Risk Agent": "/ai_risk_review",
  "Portfolio CIO Agent": "/ai_portfolio_review",
  "Technical Portfolio Agent": "/md_technical_analysis",
  "Risk Agent": "/ai_risk_review",
  "IPO Ranking Agent": "/last_30_days_ai_ranking",
    "Sentiment Agent": "/ai_sentiment_summary",
  "Deal(IPO) Agent": "/ai_unsupervised_summary",
  
  "Gator IPO Agent": "/gator_ipo_analysis",
  "JRitter IPO Agent": "/jritter_agent",
  "Quant Agent": "/quant_agent",
  "Gator POST IPO": "/gator_post_ipo",
};

export const SCHEDULE_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  hourly: "Hourly",
  one_time: "One Time",
  cron: "Custom Schedule",
};

export const WEEKDAY_MAP: Record<string, string> = {
  "0": "Sunday",
  "1": "Monday",
  "2": "Tuesday",
  "3": "Wednesday",
  "4": "Thursday",
  "5": "Friday",
  "6": "Saturday",
};

function formatScheduleTime(time?: string): string {
  if (!time) {
    return "";
  }

  const normalizedTime = time.trim();
  const timeMatch = normalizedTime.match(/^(\d{1,2}):(\d{2})$/);

  if (!timeMatch) {
    return normalizedTime;
  }

  const hours = Number(timeMatch[1]);
  const minutes = timeMatch[2];

  if (Number.isNaN(hours) || hours < 0 || hours > 23) {
    return normalizedTime;
  }

  const meridiem = hours >= 12 ? "PM" : "AM";
  const twelveHour = hours % 12 || 12;

  return `${twelveHour}:${minutes} ${meridiem}`;
}

export function formatSchedule(agent: AIAgent): string {
  const { schedule_type, schedule_value } = agent;
  if (schedule_type === "daily" && schedule_value) {
    return `Every day at ${formatScheduleTime(schedule_value)}`;
  }
  if (schedule_type === "weekly" && schedule_value) {
    const [day, time] = schedule_value.split(",");
    const dayName = WEEKDAY_MAP[day] || `Day ${day}`;
    return `Every ${dayName}${time ? ` at ${formatScheduleTime(time)}` : ""}`;
  }
  if (schedule_type === "hourly" && schedule_value) {
    return `Every ${schedule_value} hour(s)`;
  }
  if (schedule_type === "one_time") {
    return "One Time";
  }
  if (schedule_type === "cron") {
    // Friendly label for known cron patterns
    if (schedule_value === "0 10 1-7 * 1") {
      return `1st Monday of each month at ${formatScheduleTime("10:00")}`;
    }
    return `Cron: ${schedule_value}`;
  }
  return SCHEDULE_LABELS[schedule_type] || schedule_type;
}
