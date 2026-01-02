export function formatFinancialValue(value: number | string): string {
  if (value === null || value === undefined || value === "N/A") return "N/A";

  const num = Number(value);
  if (isNaN(num)) return String(value);


  const rounded = Math.round(num);
  const absValue = Math.abs(rounded).toLocaleString("en-US");

  return rounded < 0 ? `(${absValue})` : absValue;
}

export function formatFinancialMargin(value: number | string): string {
  if (value === null || value === undefined || value === "N/A") return "N/A";

  const num = Number(value);
  if (isNaN(num)) return String(value);

  // NM condition
  if (num < -100) return "NM";
  if (num > 2000) return "NM";

  // round and remove decimals
  const rounded = Math.round(num);
  const absValue = Math.abs(rounded).toLocaleString("en-US");

  // add % at the end
  return rounded < 0 ? `(${absValue}%)` : `${absValue}%`;
}
