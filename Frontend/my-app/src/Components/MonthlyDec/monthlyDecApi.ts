import axios from "axios";
import env from "../../env";

const ACCESS_KEY = "access_token";
const BASE = () =>
  env.apiUrl || (process.env.REACT_APP_API_URL as string) || "";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(ACCESS_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RangeKey = "YTD" | "1M" | "3M" | "6M" | "1Y";
export type PnlMode = "pct_aum" | "dollars";

export interface CumulativePnlPoint {
  date: string;
  fund: number;
  snp_500: number;
}

export interface CumulativePnlResponse {
  data: CumulativePnlPoint[];
  range: RangeKey;
  mode: PnlMode;
  start_date?: string;
  end_date?: string;
}

export interface VolPoint {
  date: string;
  portfolio: number;
  snp_500: number;
}

export interface VolResponse {
  data: VolPoint[];
  fund?: string | null;
  start_date?: string;
  end_date?: string;
}

export interface DrawdownPoint {
  date: string;
  portfolio: number;
  snp_500: number;
}

export interface DrawdownResponse {
  data: DrawdownPoint[];
  fund?: string | null;
  start_date?: string;
  end_date?: string;
}

export interface QuarterlyVolumePoint {
  quarter: string;
  ipo: number;
  fo: number;
  total: number;
}

export interface QuarterlyVolumeResponse {
  data: QuarterlyVolumePoint[];
  start_year: number;
  end_year: number;
}

export interface RegionPiePoint {
  label: string;
  value: number;
}

export interface RegionSectorResponse {
  ipo_by_region: RegionPiePoint[];
  fo_by_region: RegionPiePoint[];
  by_sector: RegionPiePoint[];
  year: number;
  quarter: number;
}

export interface QuarterlyDealPerformanceRow {
  quarter: string;
  total_deal_count: number;
  total_deal_volume: number;
  pct_positive_deals: number;
  pct_negative_deals: number;
  wavg_t1m_excess_positive: number;
  wavg_t1m_excess_negative: number;
  expected_returns_excess: number;
  opportunity_value_excess: number;
  is_total: boolean;
}

export interface QuarterlyDealPerformanceResponse {
  data: QuarterlyDealPerformanceRow[];
  total: QuarterlyDealPerformanceRow;
  start_year: number;
  end_year: number;
}

export interface DeskPnlRow {
  desk: string;
  ytd_pnl: number;
}

export interface DeskPnlResponse {
  data: DeskPnlRow[];
  total: number;
  as_of: string | null;
}

export interface SectorPnlRow {
  sector: string;
  ytd_pnl: number;
}

export interface SectorPnlResponse {
  data: SectorPnlRow[];
  total: number;
  as_of: string | null;
}

export interface MonthlyRegionPnlRow {
  region: string;
  monthly: Record<string, number>;
  ytd: number;
}

export interface MonthlyRegionPnlResponse {
  months: string[];
  rows: MonthlyRegionPnlRow[];
  total_row: MonthlyRegionPnlRow;
  year: number | null;
}

export interface MonthlyStrategyPnlRow {
  asset_type: string;
  monthly: Record<string, number>;
  ytd: number;
}

export interface MonthlyStrategyPnlResponse {
  months: string[];
  rows: MonthlyStrategyPnlRow[];
  total_row: MonthlyStrategyPnlRow;
  year: number | null;
}

export interface IssuerPnlRow {
  issuer: string;
  ytd_pnl: number;
}

export interface TopContributorsDetractorsResponse {
  contributors: IssuerPnlRow[];
  detractors: IssuerPnlRow[];
  as_of: string | null;
}

export interface ExposurePoint {
  date: string;
  gross_mv: number;
  delta_net: number;
  beta_net: number;
  gross_mv_pct: number;
  delta_net_pct: number;
  beta_net_pct: number;
}

export interface ExposureProgressionResponse {
  data: ExposurePoint[];
  fund: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface SectorExposureRow {
  sector: string;
  ytd_pnl: number;
  gross_market_value: number;
  net_notional_exp: number;
  delta_adj_net_exp: number;
  beta_adj_net_exp: number;
}

export interface SectorExposureBreakdownResponse {
  rows: SectorExposureRow[];
  total: SectorExposureRow;
  as_of: string | null;
}

export interface DeskExposureRow {
  desk: string;
  ytd_pnl: number;
  gross_market_value: number;
  net_notional_exp: number;
  delta_adj_net_exp: number;
  beta_adj_net_exp: number;
}

export interface DeskExposureBreakdownResponse {
  rows: DeskExposureRow[];
  total: DeskExposureRow;
  as_of: string | null;
}

export interface SingleNameExposureRow {
  issuer: string;
  gross_market_value: number;
  net_notional_exp: number;
  delta_adj_net_exp: number;
  beta_adj_net_exp: number;
}

export interface TopSingleNameExposuresResponse {
  rows: SingleNameExposureRow[];
  var_1pct: number;
  as_of: string | null;
}

export interface DealScreeningBucket {
  screened: number;
  participated: number;
  avg_alloc_pct_deal_size: number;
  avg_alloc_pct_ioi: number;
  avg_hold_period: number;
}

export interface DealScreeningMetricsResponse {
  year: number;
  ipo: DealScreeningBucket;
  fo: DealScreeningBucket;
  total: DealScreeningBucket;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

export async function fetchCumulativePnl(
  range: RangeKey = "YTD",
  fund?: string,
  mode: PnlMode = "pct_aum"
): Promise<CumulativePnlResponse> {
  const params: Record<string, string> = { range, mode };
  if (fund) params.fund = fund;
  const r = await axios.get<CumulativePnlResponse>(
    `${BASE()}/api/monthly_dec/cumulative_pnl/`,
    { headers: authHeaders(), params }
  );
  return r.data;
}

export async function fetchRealizedVolatility(
  fund?: string
): Promise<VolResponse> {
  const params: Record<string, string> = {};
  if (fund) params.fund = fund;
  const r = await axios.get<VolResponse>(
    `${BASE()}/api/monthly_dec/realized_volatility/`,
    { headers: authHeaders(), params }
  );
  return r.data;
}

export async function fetchDrawdown(
  fund?: string
): Promise<DrawdownResponse> {
  const params: Record<string, string> = {};
  if (fund) params.fund = fund;
  const r = await axios.get<DrawdownResponse>(
    `${BASE()}/api/monthly_dec/drawdown/`,
    { headers: authHeaders(), params }
  );
  return r.data;
}

export async function fetchQuarterlyDealVolume(
  startYear = 2024,
  endYear?: number
): Promise<QuarterlyVolumeResponse> {
  const params: Record<string, string> = { start_year: String(startYear) };
  if (endYear) params.end_year = String(endYear);
  const r = await axios.get<QuarterlyVolumeResponse>(
    `${BASE()}/api/monthly_dec/quarterly_deal_volume/`,
    { headers: authHeaders(), params }
  );
  return r.data;
}

export async function fetchRegionSector(
  year?: number,
  quarter?: number
): Promise<RegionSectorResponse> {
  const params: Record<string, string> = {};
  if (year) params.year = String(year);
  if (quarter) params.quarter = String(quarter);
  const r = await axios.get<RegionSectorResponse>(
    `${BASE()}/api/monthly_dec/region_sector/`,
    { headers: authHeaders(), params }
  );
  return r.data;
}

export async function fetchQuarterlyDealPerformance(
  startYear = 2024,
  endYear?: number
): Promise<QuarterlyDealPerformanceResponse> {
  const params: Record<string, string> = { start_year: String(startYear) };
  if (endYear) params.end_year = String(endYear);
  const r = await axios.get<QuarterlyDealPerformanceResponse>(
    `${BASE()}/api/monthly_dec/quarterly_deal_performance/`,
    { headers: authHeaders(), params }
  );
  return r.data;
}

export async function fetchPnlByDesk(fund?: string): Promise<DeskPnlResponse> {
  const params: Record<string, string> = {};
  if (fund) params.fund = fund;
  const r = await axios.get<DeskPnlResponse>(
    `${BASE()}/api/monthly_dec/pnl_by_desk/`,
    { headers: authHeaders(), params }
  );
  return r.data;
}

export async function fetchPnlBySector(fund?: string): Promise<SectorPnlResponse> {
  const params: Record<string, string> = {};
  if (fund) params.fund = fund;
  const r = await axios.get<SectorPnlResponse>(
    `${BASE()}/api/monthly_dec/pnl_by_sector/`,
    { headers: authHeaders(), params }
  );
  return r.data;
}

export async function fetchMonthlyPnlByRegion(
  year?: number,
  fund?: string
): Promise<MonthlyRegionPnlResponse> {
  const params: Record<string, string> = {};
  if (year) params.year = String(year);
  if (fund) params.fund = fund;
  const r = await axios.get<MonthlyRegionPnlResponse>(
    `${BASE()}/api/monthly_dec/monthly_pnl_by_region/`,
    { headers: authHeaders(), params }
  );
  return r.data;
}

export async function fetchMonthlyPnlByStrategy(
  year?: number,
  fund?: string
): Promise<MonthlyStrategyPnlResponse> {
  const params: Record<string, string> = {};
  if (year) params.year = String(year);
  if (fund) params.fund = fund;
  const r = await axios.get<MonthlyStrategyPnlResponse>(
    `${BASE()}/api/monthly_dec/monthly_pnl_by_strategy/`,
    { headers: authHeaders(), params }
  );
  return r.data;
}

export async function fetchTopContributorsDetractors(
  fund?: string,
  limit = 5
): Promise<TopContributorsDetractorsResponse> {
  const params: Record<string, string> = { limit: String(limit) };
  if (fund) params.fund = fund;
  const r = await axios.get<TopContributorsDetractorsResponse>(
    `${BASE()}/api/monthly_dec/top_contributors_detractors/`,
    { headers: authHeaders(), params }
  );
  return r.data;
}

export async function fetchExposureProgression(
  fund?: string
): Promise<ExposureProgressionResponse> {
  const params: Record<string, string> = {};
  if (fund) params.fund = fund;
  const r = await axios.get<ExposureProgressionResponse>(
    `${BASE()}/api/monthly_dec/exposure_progression/`,
    { headers: authHeaders(), params }
  );
  return r.data;
}

export async function fetchSectorExposureBreakdown(
  fund?: string
): Promise<SectorExposureBreakdownResponse> {
  const params: Record<string, string> = {};
  if (fund) params.fund = fund;
  const r = await axios.get<SectorExposureBreakdownResponse>(
    `${BASE()}/api/monthly_dec/sector_exposure_breakdown/`,
    { headers: authHeaders(), params }
  );
  return r.data;
}

export async function fetchDeskExposureBreakdown(
  fund?: string
): Promise<DeskExposureBreakdownResponse> {
  const params: Record<string, string> = {};
  if (fund) params.fund = fund;
  const r = await axios.get<DeskExposureBreakdownResponse>(
    `${BASE()}/api/monthly_dec/desk_exposure_breakdown/`,
    { headers: authHeaders(), params }
  );
  return r.data;
}

export async function fetchTopSingleNameExposures(
  fund?: string,
  limit = 5
): Promise<TopSingleNameExposuresResponse> {
  const params: Record<string, string> = { limit: String(limit) };
  if (fund) params.fund = fund;
  const r = await axios.get<TopSingleNameExposuresResponse>(
    `${BASE()}/api/monthly_dec/top_single_name_exposures/`,
    { headers: authHeaders(), params }
  );
  return r.data;
}

export async function fetchDealScreeningMetrics(
  year?: number
): Promise<DealScreeningMetricsResponse> {
  const params: Record<string, string> = {};
  if (year) params.year = String(year);
  const r = await axios.get<DealScreeningMetricsResponse>(
    `${BASE()}/api/monthly_dec/deal_screening_metrics/`,
    { headers: authHeaders(), params }
  );
  return r.data;
}
