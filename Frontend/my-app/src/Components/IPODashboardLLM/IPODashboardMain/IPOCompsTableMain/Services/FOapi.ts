const apiUrl = process.env.REACT_APP_API_URL!;
const token = localStorage.getItem("access_token");

const headers = {
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
};

export const searchTickers = async (query: string) => {
  const res = await fetch(`${apiUrl}/api/factset_tickerlist/?search=${query}`, {  headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          }, });
  if (!res.ok) throw new Error("Failed to fetch tickers");
  return res.json();
};

export const addCompetitor = async (ticker: string, competitor: string) => {
  const res = await fetch(`${apiUrl}/api/fo_fs_ticker_competitor_insert/`, {
    method: "POST",
     headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
    body: JSON.stringify({ ticker, competitor }),
  });
  if (!res.ok) throw new Error("No data found for the given ticker");
  return res.json();
};

export const deleteCompetitor = async (ticker: string, competitor: string) => {
  const res = await fetch(`${apiUrl}/api/fo_fs_ticker_competitor_delete/`, {
    method: "POST",
     headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
    body: JSON.stringify({ ticker, competitor }),
  });
  if (!res.ok) throw new Error("Failed to delete competitor");
  return res.json();
};



export const updateRow = async (row: any) => {
  const res = await fetch(`${apiUrl}/api/fo_fs_fundamental_data_upload/`, {
    method: "PATCH",
     headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error("Failed to update row");
  return res.json();
};
