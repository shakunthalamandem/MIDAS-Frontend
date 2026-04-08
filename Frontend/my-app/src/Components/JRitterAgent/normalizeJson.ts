/**
 * Normalizes both JSON formats into a common shape for the dashboard/scorecard.
 *
 * NEW format: { analysis: { ticker, company, composite_score: { score, max, grade, summary }, key_criteria: [...], key_metrics: {...}, strengths, concerns } }
 * LEGACY format: { ticker, company_name, ritter_scores: { composite_score, dimensions: [...] }, current_market, ipo_data, company_fundamentals, underwriters }
 */

export interface NormalizedDimension {
  id: string | number;
  label: string;
  score: number;
  max_score: number;
  signal: string;
  data_point?: string;
  ritter_benchmark?: string;
  rating?: string;
}

export interface NormalizedData {
  ticker: string;
  company_name: string;
  exchange: string;
  sector: string;
  ipo_date: string;
  days_since_ipo: number;
  composite_score: number;
  composite_max: number;
  composite_grade: string;
  composite_summary: string;
  verdict: string;
  dimensions: NormalizedDimension[];
  strengths: string[];
  concerns: string[];
  key_metrics: Record<string, any>;
  ipo_data: Record<string, any>;
  fundamentals: Record<string, any>;
  underwriters: any[];
  lead_underwriter_cm_rank?: number;
  disclaimer: string;
  methodology: string;
  raw: any; // original json
}

export function normalizeJson(json: any): NormalizedData {
  if (!json) return emptyNormalized();

  const analysis = json.analysis;

  if (analysis) {
    return normalizeNewFormat(json);
  }
  return normalizeLegacyFormat(json);
}

function normalizeNewFormat(json: any): NormalizedData {
  const a = json.analysis;
  const cs = a.composite_score || {};
  const km = a.key_metrics || {};
  const criteria = a.key_criteria || [];

  const dimensions: NormalizedDimension[] = criteria.map((c: any) => ({
    id: c.id ?? c.name,
    label: c.name,
    score: c.score,
    max_score: c.max,
    signal: c.signal || "neutral",
    data_point: c.finding || "",
    ritter_benchmark: c.ritter_reference || "",
    rating: c.rating || "",
  }));

  return {
    ticker: a.ticker || "",
    company_name: a.company || "",
    exchange: a.exchange || "",
    sector: a.sector || "",
    ipo_date: a.ipo_date || "",
    days_since_ipo: typeof a.scored_as_of === "string" && typeof a.ipo_date === "string"
      ? daysBetween(a.ipo_date, a.scored_as_of)
      : 0,
    composite_score: cs.score ?? 0,
    composite_max: cs.max ?? 100,
    composite_grade: cs.grade || "",
    composite_summary: cs.summary || "",
    verdict: cs.grade ? `Grade ${cs.grade}` : (cs.summary || ""),
    dimensions,
    strengths: a.strengths || [],
    concerns: a.concerns || [],
    key_metrics: km,
    ipo_data: {
      offer_price: km.ipo_price,
      first_day_close: km.day1_close,
      first_day_return_pct: km.day1_return_pct,
      gross_proceeds_m: parseProceeds(km.gross_proceeds_usd),
      ipo_range_low: km.ipo_range?.low,
      ipo_range_high: km.ipo_range?.high,
      shares_offered: km.shares_offered_final,
    },
    fundamentals: {
      revenue_m: parseProceeds(km.ltm_revenue_usd),
      net_income_m: parseProceeds(km.ltm_net_income_usd),
      sector: a.sector,
      price_to_sales: km.price_to_sales_multiple,
    },
    underwriters: [],
    lead_underwriter_cm_rank: undefined,
    disclaimer: a.disclaimer || "",
    methodology: a.methodology || "",
    raw: json,
  };
}

function normalizeLegacyFormat(json: any): NormalizedData {
  const scores = json.ritter_scores || {};
  const market = json.current_market || {};
  const ipo = json.ipo_data || {};
  const fund = json.company_fundamentals || {};
  const dims = scores.dimensions || [];

  const dimensions: NormalizedDimension[] = dims.map((d: any) => ({
    id: d.id,
    label: d.label,
    score: d.score,
    max_score: d.max_score,
    signal: d.signal || "neutral",
    data_point: d.data_point || "",
    ritter_benchmark: d.ritter_benchmark || "",
  }));

  return {
    ticker: json.ticker || "",
    company_name: json.company_name || "",
    exchange: json.exchange || "",
    sector: fund.sector || "",
    ipo_date: json.ipo_date || "",
    days_since_ipo: json.days_since_ipo ?? 0,
    composite_score: scores.composite_score ?? 0,
    composite_max: scores.composite_max ?? 100,
    composite_grade: "",
    composite_summary: scores.verdict_label || scores.verdict || "",
    verdict: scores.verdict_label || scores.verdict || "",
    dimensions,
    strengths: [],
    concerns: [],
    key_metrics: {
      current_price: market.current_price,
      market_cap_b: market.market_cap_b,
      return_vs_ipo_pct: market.return_vs_ipo_pct,
    },
    ipo_data: ipo,
    fundamentals: fund,
    underwriters: json.underwriters || [],
    lead_underwriter_cm_rank: json.lead_underwriter_cm_rank,
    disclaimer: json.meta?.disclaimer || "",
    methodology: "",
    raw: json,
  };
}

function emptyNormalized(): NormalizedData {
  return {
    ticker: "", company_name: "", exchange: "", sector: "", ipo_date: "",
    days_since_ipo: 0, composite_score: 0, composite_max: 100,
    composite_grade: "", composite_summary: "", verdict: "",
    dimensions: [], strengths: [], concerns: [], key_metrics: {},
    ipo_data: {}, fundamentals: {}, underwriters: [],
    disclaimer: "", methodology: "", raw: {},
  };
}

function daysBetween(d1: string, d2: string): number {
  try {
    const ms = new Date(d2).getTime() - new Date(d1).getTime();
    return Math.max(0, Math.round(ms / 86400000));
  } catch { return 0; }
}

function parseProceeds(val: any): number | undefined {
  if (val === undefined || val === null) return undefined;
  if (typeof val === "number") return val;
  const s = String(val).replace(/[,$]/g, "");
  const match = s.match(/([\d.]+)\s*([BMK])?/i);
  if (!match) return undefined;
  const num = parseFloat(match[1]);
  const unit = (match[2] || "").toUpperCase();
  if (unit === "B") return num * 1000;
  if (unit === "K") return num / 1000;
  return num; // M or raw
}
