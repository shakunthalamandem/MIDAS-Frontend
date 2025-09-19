const apiUrl = process.env.REACT_APP_API_URL!;
const token = localStorage.getItem("access_token");

const headers = {
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
};

export const searchTickers = async (query: string) => {
  const res = await fetch(`${apiUrl}/api/factset_tickerlist/?search=${query}`, { headers });
  if (!res.ok) throw new Error("Failed to fetch tickers");
  return res.json();
};

export const addCompetitor = async (ticker: string, competitor: string) => {
  const res = await fetch(`${apiUrl}/api/fs_ticker_competitor_insert/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ticker, competitor }),
  });
  if (!res.ok) throw new Error("Failed to add competitor");
  return res.json();
};

export const deleteCompetitor = async (ticker: string, competitor: string) => {
  const res = await fetch(`${apiUrl}/api/fs_ticker_competitor_delete/`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ ticker, competitor }),
  });
  if (!res.ok) throw new Error("Failed to delete competitor");
  return res.json();
};

export const updateRow = async (row: any) => {
  const res = await fetch(`${apiUrl}/api/fs_fundamental_data_upload/`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error("Failed to update row");
  return res.json();
};
