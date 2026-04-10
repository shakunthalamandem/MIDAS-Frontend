import { FilterRule, FormulaType } from "./types";
import { UNSAFE_SQL_KEYWORDS } from "./constants";

const API_URL = process.env.REACT_APP_API_URL;

export { API_URL };

export const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Convert snake_case table/column names to Human Readable Title Case.
 * e.g. "market_data_dump" -> "Market Data Dump"
 */
export const formatTableName = (raw: string): string => {
  if (!raw) return "";
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Generate a safe PostgreSQL SELECT query string.
 */
export const generateSelectQuery = (
  table: string,
  columns: string[],
  filters: FilterRule[],
  limit: number = 100
): string => {
  const colsPart = columns.length > 0 ? columns.join(", ") : "*";
  let query = `SELECT ${colsPart}\nFROM ${table}`;

  const activeFilters = filters.filter((f) => f.column);
  if (activeFilters.length > 0) {
    const whereClauses = activeFilters.map((f) => {
      if (f.operator === "IS NULL") return `${f.column} IS NULL`;
      if (f.operator === "IS NOT NULL") return `${f.column} IS NOT NULL`;
      if (f.operator === "IN") {
        const vals = f.value
          .split(",")
          .map((v) => `'${v.trim().replace(/'/g, "''")}'`)
          .join(", ");
        return `${f.column} IN (${vals})`;
      }
      if (f.operator === "LIKE" || f.operator === "ILIKE") {
        return `${f.column} ${f.operator} '%${f.value.replace(/'/g, "''")}%'`;
      }
      return `${f.column} ${f.operator} '${f.value.replace(/'/g, "''")}'`;
    });
    query += `\nWHERE ${whereClauses.join("\n  AND ")}`;
  }

  query += `\nLIMIT ${limit};`;
  return query;
};

/**
 * Check if a query string contains unsafe SQL keywords.
 */
export const isQuerySafe = (sql: string): boolean => {
  const upper = sql.toUpperCase();
  for (const keyword of UNSAFE_SQL_KEYWORDS) {
    // Match whole word only
    const regex = new RegExp(`\\b${keyword}\\b`);
    if (regex.test(upper)) return false;
  }
  return true;
};

/**
 * Compute a formula on an array of numeric values.
 */
export const computeFormula = (
  formula: FormulaType,
  values: (number | null | undefined)[]
): number | null => {
  const nums = values.filter(
    (v): v is number => v !== null && v !== undefined && !isNaN(v)
  );
  if (nums.length === 0) return null;

  switch (formula) {
    case "SUM":
      return nums.reduce((a, b) => a + b, 0);
    case "AVG":
      return nums.reduce((a, b) => a + b, 0) / nums.length;
    case "COUNT":
      return nums.length;
    case "MIN":
      return Math.min(...nums);
    case "MAX":
      return Math.max(...nums);
    default:
      return null;
  }
};
