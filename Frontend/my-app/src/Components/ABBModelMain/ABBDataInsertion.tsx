import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

const booleanFields = [
  "clean_up",
  "seasoned",
  "timing",
  "primary",
  "emerging_mkt",
];

const convertToBinaryFlag = (value: any) => {
  if (value === undefined || value === null) {
    return value;
  }

  if (
    value === true ||
    value === "Yes" ||
    value === "yes" ||
    value === "TRUE" ||
    value === "True" ||
    value === "true" ||
    value === 1 ||
    value === "1"
  ) {
    return 1;
  }

  if (
    value === false ||
    value === "No" ||
    value === "no" ||
    value === "FALSE" ||
    value === "False" ||
    value === "false" ||
    value === 0 ||
    value === "0"
  ) {
    return 0;
  }

  return value;
};

const normalizeBooleanFields = (source: Record<string, any>) => {
  const normalized = { ...source };
  booleanFields.forEach((field) => {
    if (field in normalized) {
      normalized[field] = convertToBinaryFlag(normalized[field]);
    }
  });
  return normalized;
};

interface ABBDataCreation {
  payload: Record<string, any> | null;
  apiResponse: Record<string, any>;
}

const ABBDataInsertion = ({ AbbDataCreation }: { AbbDataCreation: ABBDataCreation | null }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [responseData, setResponseData] = useState<any>(null);
  const lastPayloadHashRef = useRef<string | null>(null);

  // Prepare the payload to be sent to the API
  const preparePayload = () => {
    if (!AbbDataCreation) {
      return null;
    }

    const { payload, apiResponse } = AbbDataCreation;
    if (!payload || !apiResponse) {
      return null;
    }

    const launchDate = payload.launch_date || payload.trade_date || "";
    const sanitizedLaunchDate = launchDate.replace(/-/g, "") || "UNKNOWN";
    const ticker = payload.ticker ? payload.ticker.toUpperCase() : "UNKNOWN";

    const normalizedFields = normalizeBooleanFields({
      ...payload,
      ...apiResponse,
    });

    return {
      ...normalizedFields,
      deal_id: `${ticker}_${sanitizedLaunchDate}`,
      launch_date: launchDate,
    };
  };

  // Function to call the API
  const createABBModel = async (finalPayload: Record<string, any>) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const apiUrl = process.env.REACT_APP_API_URL; // Make sure you have this in your .env file
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`${apiUrl}/api/emea_abb_model_create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(finalPayload),
      });

      if (!res.ok) {
        throw new Error("Failed to create ABB model");
      }

      const data = await res.json();
      setResponseData(data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Trigger API call when component is mounted
  useEffect(() => {
    const finalPayload = preparePayload();
    if (!finalPayload) {
      lastPayloadHashRef.current = null;
      return;
    }

    const payloadHash = JSON.stringify(finalPayload);
    if (lastPayloadHashRef.current === payloadHash) {
      return;
    }

    lastPayloadHashRef.current = payloadHash;
    createABBModel(finalPayload);
  }, [AbbDataCreation]);

  return (
    <Box sx={{ mt: 3, textAlign: 'center' }}>
      {loading && <CircularProgress />}

      {/* {success && responseData && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" color="green">
            Success!
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Model created successfully. Here's the response:
          </Typography>
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </Box>
      )} */}

      {error && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="error">{`Error: ${error}`}</Alert>
        </Box>
      )}
    </Box>
  );
};

export default ABBDataInsertion;
