import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
} from "@mui/material";
import { green, red, blue } from "@mui/material/colors";
import ABBDataInsertion from "./ABBDataInsertion";
import ABBDiscountTable from "./ABBDiscountTable";
import ABBAdditionalFundamentals from "./ABBAdditionalFundamentals";

interface Payload {
  ticker: string;
  trade_date: string;
  launch_date: string;
  clean_up: boolean;
  seasoned: boolean;
  timing: boolean;
  primary: boolean;
  emerging_mkt: boolean;
  block_deal_shares: number;
  block_deal_percentage_of_market_cap: number;
  block_deal_value_in_local_currency: number;
  block_deal_value_in_dollar: number;
}

interface FlattenedRow {
  keyPath: string;
  label: string;
  displayValue: string | null;
  depth: number;
  isGroupHeader: boolean;
  rawValue: any;
}

interface ABBModelResponseDataProps {
  payload: Payload | null;
  prefetchedData?: any | null;
  onModelCreated?: () => void;
}

const formatLabel = (key: string) =>
  key
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const formatValue = (value: any, key: string) => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "-";
  }

  if (typeof value === "number") {
    const lowerKey = key.toLowerCase();
    const percentKeys = ["percent", "rsi", "volatility"];
    const currencyKeys = [
      "price",
      "value",
      "cap",
      "market",
      "vwap",
      "adtv",
      "dividend",
      "yield",
      "enterprise",
    ];

    if (percentKeys.some((term) => lowerKey.includes(term))) {
      return `${value.toFixed(2)}%`;
    }

    if (currencyKeys.some((term) => lowerKey.includes(term))) {
      return `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return value.toLocaleString(undefined, { maximumFractionDigits: 3 });
  }

  return String(value);
};

const flattenData = (
  payload: any,
  depth = 0,
  parentPath = ""
): FlattenedRow[] => {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  return Object.entries(payload).flatMap(([key, value]) => {
    if (key.toLowerCase() === "company_description") {
      return [];
    }

    const keyPath = parentPath ? `${parentPath}.${key}` : key;
    const label = formatLabel(key);

    if (value && typeof value === "object" && !Array.isArray(value)) {
      return [
        {
          keyPath,
          label,
          displayValue: null,
          depth,
          isGroupHeader: true,
          rawValue: value,
        },
        ...flattenData(value, depth + 1, keyPath),
      ];
    }

    return [
      {
        keyPath,
        label,
        displayValue: formatValue(value, key),
        depth,
        isGroupHeader: false,
        rawValue: value,
      },
    ];
  });
};

const getValueColor = (value: any) => {
  if (typeof value === "number") {
    if (value > 0) return green[600];
    if (value < 0) return red[600];
    return blue[700];
  }
  return blue[900];
};

const ABBModelResponseData = ({
  payload,
  prefetchedData = null,
  onModelCreated,
}: ABBModelResponseDataProps) => {
  const [data, setData] = useState<any | null>(prefetchedData ?? null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (prefetchedData) {
      setData(prefetchedData);
      setLoading(false);
      setError(null);
      return;
    }

    if (!payload) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      setLoading(true);
      setError(null);
      setData(null);

      try {
        const res = await fetch(`${apiUrl}/api/abb_factset_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await res.json();
        setData(result);
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return;
        }
        setError(err?.message ?? "Failed to fetch data");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => controller.abort();
  }, [payload, prefetchedData]);

  const AbbDataCreation = useMemo(() => {
    if (loading || !data) {
      return null;
    }

    return {
      payload,
      apiResponse: data,
    };
  }, [payload, data, loading]);

  if (loading) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="#000000">
          Loading ABB response...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="error">
          Error: {error}
        </Typography>
      </Box>
    );
  }

if (!data) {
    return null;
  }

  const rows = flattenData(data);
  const discountRows = rows.filter(
    (row) => !row.isGroupHeader && row.keyPath.toLowerCase().includes("discount")
  );
  const overviewRows = rows.filter(
    (row) => !row.keyPath.toLowerCase().includes("discount")
  );

  const mid = Math.ceil(overviewRows.length / 2);
  const leftRows = overviewRows.slice(0, mid);
  const rightRows = overviewRows.slice(mid);

  // Extract highlighted rows
  const liquidityRow = discountRows.find(r => r.label === "Liquidity Model Discount");
  const totalRow = discountRows.find(r => r.label === "Final Discount");

  // Remaining rows for the two small tables
  const remainingRows = discountRows.filter(
    r => r.label !== "Liquidity Model Discount" && r.label !== "Final Discount"
  );

  const leftTableRows = remainingRows.slice(0, 5);
  const rightTableRows = remainingRows.slice(5, 10);

return (
  <>
  <Container>
    <ABBDiscountTable
      liquidityRow={liquidityRow}
      totalRow={totalRow}
      leftTableRows={leftTableRows}
      rightTableRows={rightTableRows}
      getValueColor={getValueColor}
    />

    <ABBAdditionalFundamentals
      leftRows={leftRows}
      rightRows={rightRows}
      getValueColor={getValueColor}
    />

    <Box>
      <ABBDataInsertion
        AbbDataCreation={AbbDataCreation}
        onSuccess={onModelCreated}
      />
    </Box>
    </Container>
  </>
);

};

export default ABBModelResponseData;
