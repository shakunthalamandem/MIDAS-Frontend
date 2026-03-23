export interface AIAgent {
  id: number;
  name: string;
  description: string;
  agent_type: "system" | "user_created";
  prompt?: string;
  api_endpoint?: string;
  schedule_type: "daily" | "weekly" | "hourly" | "one_time" | "cron";
  schedule_value: string;
  is_active: boolean;
  created_by?: number | null;
  created_by_email?: string | null;
  created_at: string;
  updated_at: string;
  // Enriched from API
  email_enabled?: boolean;
  latest_run?: string | null;
  latest_date?: string | null;
}

export interface AgentOutput {
  id: number;
  agent: number;
  agent_name: string;
  ticker: string;
  output_data: Record<string, unknown> | null;
  run_date: string;
  run_timestamp: string;
  status: "success" | "failed" | "running";
  celery_task_id?: string | null;
  created_at: string;
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
}

// Route map for system agents (preserved from existing routes)
export const SYSTEM_AGENT_ROUTES: Record<string, string> = {
  "Portfolio CIO Agent": "/ai_portfolio_review",
  "Risk Agent": "/ai_risk_review",
  "IPO Ranking Agent": "/last_30_days_ai_ranking",
  "Deal(IPO) Agent": "/ai_unsupervised_summary",
  "Sentiment Agent": "/ai_sentiment_summary",
  "Jay Ritter IPO Agent": "/jay_ritter_ipo_analysis",
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

export function formatSchedule(agent: AIAgent): string {
  const { schedule_type, schedule_value } = agent;
  if (schedule_type === "daily" && schedule_value) {
    return `Every day at ${schedule_value}`;
  }
  if (schedule_type === "weekly" && schedule_value) {
    const [day, time] = schedule_value.split(",");
    const dayName = WEEKDAY_MAP[day] || `Day ${day}`;
    return `Every ${dayName}${time ? ` at ${time}` : ""}`;
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
      return "1st Monday of each month at 10:00";
    }
    return `Cron: ${schedule_value}`;
  }
  return SCHEDULE_LABELS[schedule_type] || schedule_type;
}
