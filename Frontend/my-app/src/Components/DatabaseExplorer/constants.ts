export const OPERATORS = [
  { value: "=", label: "= Equals" },
  { value: "!=", label: "!= Not Equals" },
  { value: ">", label: "> Greater Than" },
  { value: "<", label: "< Less Than" },
  { value: ">=", label: ">= Greater or Equal" },
  { value: "<=", label: "<= Less or Equal" },
  { value: "LIKE", label: "LIKE (Contains)" },
  { value: "ILIKE", label: "ILIKE (Contains, Case-Insensitive)" },
  { value: "IS NULL", label: "IS NULL" },
  { value: "IS NOT NULL", label: "IS NOT NULL" },
  { value: "IN", label: "IN (Comma-Separated)" },
];

export const TYPE_COLORS: Record<string, string> = {
  integer: "#7c3aed",
  bigint: "#7c3aed",
  smallint: "#7c3aed",
  numeric: "#7c3aed",
  real: "#7c3aed",
  "double precision": "#7c3aed",
  text: "#059669",
  "character varying": "#059669",
  character: "#059669",
  boolean: "#d97706",
  date: "#0891b2",
  "timestamp without time zone": "#0891b2",
  "timestamp with time zone": "#0891b2",
  jsonb: "#e11d48",
  json: "#e11d48",
  uuid: "#6366f1",
};

export const NUMERIC_PG_TYPES = new Set([
  "integer",
  "bigint",
  "smallint",
  "numeric",
  "real",
  "double precision",
  "decimal",
]);

export const FORMULA_FUNCTIONS = ["SUM", "AVG", "COUNT", "MIN", "MAX"] as const;

export const UNSAFE_SQL_KEYWORDS = new Set([
  "UPDATE",
  "DELETE",
  "INSERT",
  "DROP",
  "ALTER",
  "TRUNCATE",
  "EXEC",
  "GRANT",
  "REVOKE",
  "CREATE",
]);
