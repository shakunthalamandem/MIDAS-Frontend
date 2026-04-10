export interface TableInfo {
  table_name: string;
  approx_rows: number;
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  max_length: number | null;
  precision: number | null;
  is_primary_key: boolean;
}

export interface FilterRule {
  id: string;
  column: string;
  operator: string;
  value: string;
}

export type FormulaType = "SUM" | "AVG" | "COUNT" | "MIN" | "MAX";

export interface ComputedField {
  id: string;
  label: string;
  formula: FormulaType;
  column: string;
  result: number | null;
}

export interface StatsData {
  column: string;
  type: string;
  total_rows: number;
  distinct_count: number;
  null_count: number;
  min?: number | string;
  max?: number | string;
  avg?: number;
  top_values: { value: any; count: number }[];
}
