// Full updated ABBModelMain.tsx with search bar replacing the subtitle text

import React, { useCallback, useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Container } from "@mui/material";
import ABBModelResponseData from "./ABBModelResponseData";
import {
  blockDealFields,
  DiscountFormValues,
} from "./DiscountDataModel/ABBDiscountConfig";
import DiscountForm from "./DiscountForm";
import SearchHeader from "./SearchHeader";

const blockDealFieldKeys: Array<keyof DiscountFormValues> =
  blockDealFields.map((field) => field.key);

const getInitialFormValues = (): DiscountFormValues => ({
  ticker: "",
  tradeDate: "",
  cleanUp: "No",
  seasoned: "No",
  timing: "No",
  primary: "No",
  emergingMkt: "No",
  dealCaptain: "",
  gicsSector: "",
  blockDealShares: "",
  blockDealPercentageOfMarketCap: "",
  blockDealValueLocal: "",
  blockDealValueDollar: "",
});

const hasBlockValue = (value: string | number) => {
  if (value === "" || value === null || value === undefined) return false;
  const numericValue = Number(value);
  return !Number.isNaN(numericValue) && numericValue !== 0;
};

const parseBlockValue = (value: string | number) => {
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? 0 : numericValue;
};

const extractDistinctOptions = (data: any[], key: string): string[] => {
  if (!Array.isArray(data)) return [];
  const matchingEntry = data.find(
    (entry) => entry && typeof entry === "object" && entry[key]
  );
  if (!matchingEntry) return [];
  const config = matchingEntry[key];
  if (config && Array.isArray(config.options)) {
    return config.options.map((option: any) => String(option));
  }
  return [];
};

const toYesNoString = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return undefined;
    if (["yes", "y", "true", "1"].includes(normalized)) return "Yes";
    if (["no", "n", "false", "0"].includes(normalized)) return "No";
    return undefined;
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value === 1 ? "Yes" : "No";
  return undefined;
};

const selectionFieldMappings: Array<{
  target: keyof DiscountFormValues;
  sources: string[];
  formatter?: (value: unknown) => string | undefined;
  allowEmptyString?: boolean;
}> = [
  { target: "ticker", sources: ["ticker", "symbol", "ticker_symbol"] },
  { target: "tradeDate", sources: ["launch_date", "trade_date"] },
  { target: "cleanUp", sources: ["clean_up", "cleanUp"], formatter: toYesNoString },
  { target: "seasoned", sources: ["seasoned"], formatter: toYesNoString },
  { target: "timing", sources: ["timing"], formatter: toYesNoString },
  { target: "primary", sources: ["primary"], formatter: toYesNoString },
  {
    target: "emergingMkt",
    sources: ["emerging_mkt", "emergingMkt"],
    formatter: toYesNoString,
  },
  { target: "dealCaptain", sources: ["deal_captain", "dealCaptain"] },
  { target: "gicsSector", sources: ["gics_sector", "sector", "gicsSector"] },
  {
    target: "blockDealShares",
    sources: ["block_deal_shares", "blockDealShares"],
    allowEmptyString: true,
  },
  {
    target: "blockDealPercentageOfMarketCap",
    sources: [
      "block_deal_percentage_of_market_cap",
      "blockDealPercentageOfMarketCap",
    ],
    allowEmptyString: true,
  },
  {
    target: "blockDealValueLocal",
    sources: [
      "block_deal_value_in_local_currency",
      "blockDealValueLocal",
    ],
    allowEmptyString: true,
  },
  {
    target: "blockDealValueDollar",
    sources: ["block_deal_value_in_dollar", "blockDealValueDollar"],
    allowEmptyString: true,
  },
];

const fillFormValuesFromPayload = (
  payload: Record<string, unknown>
): Partial<DiscountFormValues> => {
  const normalized: Partial<DiscountFormValues> = {};

  selectionFieldMappings.forEach(
    ({ target, sources, formatter, allowEmptyString }) => {
      for (const source of sources) {
        if (!Object.prototype.hasOwnProperty.call(payload, source)) continue;
        const rawValue = payload[source];
        if (rawValue === null || rawValue === undefined) continue;
        if (!allowEmptyString && rawValue === "") continue;
        const formatted =
          formatter === undefined
            ? String(rawValue)
            : formatter(rawValue);
        if (formatted === undefined) continue;
        normalized[target] = formatted;
        break;
      }
    }
  );

  return normalized;
};


const ABBModelMain = () => {
  const [formValues, setFormValues] =
    useState<DiscountFormValues>(getInitialFormValues());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [companyOptions, setCompanyOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [dealCaptainOptions, setDealCaptainOptions] = useState<string[]>([]);
  const [sectorOptions, setSectorOptions] = useState<string[]>([]);

  const [submittedPayload, setSubmittedPayload] = useState<any | null>(null);
  const [prefetchedResponse, setPrefetchedResponse] = useState<any | null>(null);

  // New states for top search bar
  const [emeaOptions, setEmeaOptions] = useState<any[]>([]);
  const [emeaLoading, setEmeaLoading] = useState(false);
  const [selectedEmea, setSelectedEmea] = useState<any | null>(null);

  const fetchAllEmeaData = useCallback(async () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    if (!apiUrl) return;

    const token = localStorage.getItem("access_token");
    setEmeaLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/get_emeaabb_model_data/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await res.json();
      setEmeaOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load EMEA form data", err);
      setEmeaOptions([]);
    } finally {
      setEmeaLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllEmeaData();
  }, [fetchAllEmeaData]);



  // Fetch distinct values
  useEffect(() => {
    const fetchDistinctValues = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) return;

      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${apiUrl}/api/mdd_distinct_values/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch distinct values");

        const data = await response.json();
        const normalizedData = Array.isArray(data)
          ? data
          : data?.screener || [];

        setSectorOptions(extractDistinctOptions(normalizedData, "gics_sector"));
        setDealCaptainOptions(
          extractDistinctOptions(normalizedData, "deal_captain")
        );
      } catch (error) {
        setSectorOptions([]);
        setDealCaptainOptions([]);
      }
    };

    fetchDistinctValues();
  }, []);

  // New: Fetch EMEA tickers for search bar
  const fetchEmeaTickers = async (query: string) => {
    if (!query) {
      setEmeaOptions([]);
      return;
    }

    setEmeaLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const res = await fetch(`${apiUrl}/api/get_emeaabb_model_data/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      let data = await res.json();

      const filtered = data.filter((item: any) =>
        item.ticker.toLowerCase().includes(query.toLowerCase())
      );

      setEmeaOptions(filtered);
    } catch (err) {
      setEmeaOptions([]);
    } finally {
      setEmeaLoading(false);
    }
  };

  // Ticker search
  const handleSearch = async (query: string) => {
    if (!query) {
      setCompanyOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${apiUrl}/api/fs_ticker_search/?search=${query}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const data = await res.json();
      setCompanyOptions(data);
    } catch (err) {
      setCompanyOptions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearErrorsForKeys = (keys: Array<keyof DiscountFormValues>) => {
    if (!keys.length) return;
    setFormErrors((prevErrors) => {
      if (!prevErrors || !Object.keys(prevErrors).length) return prevErrors;
      const nextErrors = { ...prevErrors };
      keys.forEach((key) => {
        if (nextErrors[key]) {
          delete nextErrors[key];
        }
      });
      return nextErrors;
    });
  };

  const applyPayloadToFormValues = (payload: Record<string, unknown>) => {
    const updates = fillFormValuesFromPayload(payload);
    if (!updates.ticker) {
      const fallbackTicker =
        (typeof payload.ticker === "string" && payload.ticker) ||
        (typeof payload.symbol === "string" && payload.symbol) ||
        (typeof payload.ticker_symbol === "string" &&
          payload.ticker_symbol);
      if (fallbackTicker) {
        updates.ticker = fallbackTicker;
      }
    }
    if (!Object.keys(updates).length) return updates;

    setFormValues((prev) => ({
      ...prev,
      ...updates,
    }));
    clearErrorsForKeys(
      Object.keys(updates) as Array<keyof DiscountFormValues>
    );
    return updates;
  };

  const handleCompanySelect = (value: any | null) => {
    if (!value) {
      setFormValues((prev) => ({ ...prev, ticker: "" }));
      return;
    }
    applyPayloadToFormValues(value);
  };

  const handleEmeaSelect = async (value: any | null) => {
    setSelectedEmea(value);
    if (!value) {
      setPrefetchedResponse(null);
      setSubmittedPayload(null);
      return;
    }

    setPrefetchedResponse(null);
    applyPayloadToFormValues(value);

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const payloadToSend = {
        ticker: value.ticker,
        deal_id: value.deal_id,
      };

      const res = await fetch(`${apiUrl}/api/emea_abb_model_data_fetch/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payloadToSend),
      });

      const responseData = await res.json();

      setSubmittedPayload(null);
      setPrefetchedResponse(responseData);
    } catch (err) {
      console.error("EMEA fetch failed:", err);
      setPrefetchedResponse(null);
    }
  };

  const handleFieldChange = (key: keyof DiscountFormValues) => (e: any) => {
    const value = e.target.value;

    setFormValues((prev: DiscountFormValues) => {
      const updatedValue = blockDealFieldKeys.includes(key)
        ? value === "" ? "" : value
        : value;

      const updatedFormValues = { ...prev, [key]: updatedValue };

      setFormErrors((prevErrors) => {
        if (!prevErrors || Object.keys(prevErrors).length === 0) return prevErrors;
        const nextErrors = { ...prevErrors };

        if (updatedValue && nextErrors[key]) delete nextErrors[key];

        if (blockDealFieldKeys.includes(key)) {
          const hasAnyBlockValue = blockDealFieldKeys.some((fieldKey) =>
            hasBlockValue(updatedFormValues[fieldKey])
          );
          if (hasAnyBlockValue) {
            blockDealFieldKeys.forEach((fieldKey) => delete nextErrors[fieldKey]);
          }
        }

        return nextErrors;
      });

      return updatedFormValues;
    });
  };

  const mapYesNoToBool = (value: string) => value === "Yes";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors: Record<string, string> = {};

    if (!formValues.ticker) validationErrors.ticker = "Ticker is required";
    if (!formValues.tradeDate) validationErrors.tradeDate = "Launch date is required";

    const hasAnyBlockValue = blockDealFieldKeys.some((key) =>
      hasBlockValue(formValues[key])
    );

    if (!hasAnyBlockValue) {
      blockDealFieldKeys.forEach((key) => {
        validationErrors[key] = "Enter at least one block deal value";
      });
    }

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setFormErrors({});

    const payload = {
      ticker: formValues.ticker,
      trade_date: formValues.tradeDate,
      launch_date: formValues.tradeDate,
      clean_up: mapYesNoToBool(formValues.cleanUp),
      seasoned: mapYesNoToBool(formValues.seasoned),
      timing: mapYesNoToBool(formValues.timing),
      primary: mapYesNoToBool(formValues.primary),
      emerging_mkt: mapYesNoToBool(formValues.emergingMkt),
      deal_captain: formValues.dealCaptain,
      sector: formValues.gicsSector,
      block_deal_shares: parseBlockValue(formValues.blockDealShares),
      block_deal_percentage_of_market_cap: parseBlockValue(
        formValues.blockDealPercentageOfMarketCap
      ),
      block_deal_value_in_local_currency: parseBlockValue(
        formValues.blockDealValueLocal
      ),
      block_deal_value_in_dollar: parseBlockValue(
        formValues.blockDealValueDollar
      ),
    };

    setPrefetchedResponse(null);
    setSubmittedPayload(payload);
  };

  const handleReset = () => {
    setFormValues(getInitialFormValues());
    setFormErrors({});
    setSubmittedPayload(null);
    setPrefetchedResponse(null);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Card
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            boxShadow: "0 12px 50px rgba(9, 30, 66, 0.08)",
            background: "linear-gradient(135deg, #f5f9ff 0%, #e0efff 100%)",
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
                gap: 2,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#0b2b57" }}>
                ABB Discount Data
              </Typography>
              <SearchHeader
                options={emeaOptions}
                loading={emeaLoading}
                value={selectedEmea}
                onInputChange={fetchEmeaTickers}
                onSelect={handleEmeaSelect}
              />
            </Box>

            <DiscountForm
              formValues={formValues}
              formErrors={formErrors}
              companyOptions={companyOptions}
              searchLoading={searchLoading}
              dealCaptainOptions={dealCaptainOptions}
              sectorOptions={sectorOptions}
              onSearchInput={handleSearch}
              onCompanySelect={handleCompanySelect}
              onFieldChange={handleFieldChange}
              onSubmit={handleSubmit}
              onReset={handleReset}
            />
          </CardContent>

        </Card>

        {/* ----------------- RESPONSE COMPONENT ----------------- */}
        {(submittedPayload || prefetchedResponse) && (
          <Box sx={{ mt: 3 }}>
            <ABBModelResponseData
              payload={submittedPayload}
              prefetchedData={prefetchedResponse}
              onModelCreated={fetchAllEmeaData}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ABBModelMain;
