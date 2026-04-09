import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider,
} from "@mui/material";
import { Container, Paper } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const apiUrl = process.env.REACT_APP_API_URL;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

// Get last weekday (Mon-Fri)
const getDefaultDate = (): Dayjs => {
  const today = dayjs();
  const day = today.day();
  if (day === 0) return today.subtract(2, "day"); // Sunday → Friday
  if (day === 6) return today.subtract(1, "day"); // Saturday → Friday
  return today;
};

interface CheckItem {
  passed: boolean;
  message: string;
  count?: number;
  exists?: boolean;
}

interface ValidateResponse {
  status: "ready" | "warning" | "error";
  trade_date: string;
  checks: {
    date_valid: CheckItem;
    not_future: CheckItem;
    not_weekend: CheckItem;
    trades_available: CheckItem;
    technical_data_available: CheckItem;
    report_exists: CheckItem & { exists?: boolean };
  };
  can_proceed: boolean;
  warnings: string[];
  suggested_date: string | null;
  latest_trade_date: string | null;
  latest_technical_date: string | null;
}

interface RunResponse {
  status: "success" | "error";
  trade_date: string;
  report_id?: number;
  created?: boolean;
  total_positions?: number;
  processing_time_seconds?: number;
  us_tickers_processed?: number;
  technical_data_records?: number;
  technical_data_missing_tickers?: string[];
  claude_model?: string;
  error?: string;
  raw_response_file?: string;
}

const CHECK_LABELS: Record<string, string> = {
  date_valid: "Date Format",
  not_future: "Not a Future Date",
  not_weekend: "Weekday Check",
  trades_available: "Trade Data Available",
  technical_data_available: "Technical Data Available",
  report_exists: "Existing Report Check",
};

const WIZARD_STEPS = ["Select Date & Validate", "Confirm & Generate", "Result"];

const PROGRESS_STEPS = [
  "Fetching portfolio data",
  "Fetching technical data",
  "Calling Claude AI",
  "Parsing response",
  "Saving to database",
];

const CIOPortfolioReviewWizard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(getDefaultDate());
  const [validating, setValidating] = useState(false);
  const [validateResponse, setValidateResponse] = useState<ValidateResponse | null>(null);
  const [validateError, setValidateError] = useState<string>("");

  // Step 2 states
  const [generating, setGenerating] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [progressStep, setProgressStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step 3 states
  const [runResponse, setRunResponse] = useState<RunResponse | null>(null);

  const tradeDate = selectedDate ? selectedDate.format("YYYY-MM-DD") : "";

  const stopTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  };

  useEffect(() => {
    return () => stopTimers();
  }, []);

  const formatElapsed = (secs: number): string => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ── Step 1: Validate ──────────────────────────────────────────────────────
  const handleValidate = async () => {
    if (!tradeDate) return;
    setValidating(true);
    setValidateError("");
    setValidateResponse(null);
    try {
      const { data } = await axios.post<ValidateResponse>(
        `${apiUrl}/api/cio_review_validate/`,
        { trade_date: tradeDate },
        { headers: getHeaders() }
      );
      setValidateResponse(data);
    } catch (err: any) {
      setValidateError(
        err?.response?.data?.error || "Validation failed. Please try again."
      );
    } finally {
      setValidating(false);
    }
  };

  // ── Step 2: Generate ──────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setGenerating(true);
    setElapsedSeconds(0);
    setProgressStep(0);

    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    // Advance progress label every ~2.5 min (150s), cycling through steps
    progressRef.current = setInterval(() => {
      setProgressStep((p) => Math.min(p + 1, PROGRESS_STEPS.length - 1));
    }, 150_000);

    try {
      const { data } = await axios.post<RunResponse>(
        `${apiUrl}/api/cio_review_run/`,
        { trade_date: tradeDate },
        { headers: getHeaders(), timeout: 1_200_000 }
      );
      setRunResponse(data);
      setActiveStep(2);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.error ||
        (err.code === "ECONNABORTED" ? "Request timed out after 20 minutes." : "Report generation failed.");
      setRunResponse({ status: "error", trade_date: tradeDate, error: errMsg });
      setActiveStep(2);
    } finally {
      stopTimers();
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setValidateResponse(null);
    setValidateError("");
    setRunResponse(null);
    setElapsedSeconds(0);
    setProgressStep(0);
    setSelectedDate(getDefaultDate());
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderChecks = (checks: ValidateResponse["checks"]) => {
    const order: (keyof typeof checks)[] = [
      "date_valid",
      "not_future",
      "not_weekend",
      "trades_available",
      "technical_data_available",
      "report_exists",
    ];
    return order.map((key) => {
      const check = checks[key];
      return (
        <Box
          key={key}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            py: 0.75,
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          {check.passed ? (
            <CheckCircleIcon sx={{ color: "#2e7d32", fontSize: 20 }} />
          ) : (
            <CancelIcon sx={{ color: "#c62828", fontSize: 20 }} />
          )}
          <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 200 }}>
            {CHECK_LABELS[key] ?? key}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {check.message}
            {check.count !== undefined && check.count > 0 && ` (${check.count})`}
          </Typography>
        </Box>
      );
    });
  };

  // ── Step panels ───────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Select Trade Date
      </Typography>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Trade Date"
            value={selectedDate}
            onChange={(v) => {
              if (v) {
                setSelectedDate(v);
                setValidateResponse(null);
                setValidateError("");
              }
            }}
            slotProps={{ textField: { size: "small" } }}
          />
        </LocalizationProvider>
        <Button
          variant="contained"
          onClick={handleValidate}
          disabled={validating || !tradeDate}
          startIcon={validating ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{ background: "linear-gradient(to right, #4b6cb7, #182848)", color: "#fff" }}
        >
          {validating ? "Validating…" : "Validate Data"}
        </Button>
      </Box>

      {validateError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {validateError}
        </Alert>
      )}

      {validateResponse && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />

          {/* Warnings */}
          {validateResponse.warnings.map((w, i) => (
            <Alert
              key={i}
              severity="warning"
              icon={<WarningAmberIcon />}
              sx={{ mb: 1 }}
            >
              {w}
            </Alert>
          ))}

          {/* Checks */}
          <Box sx={{ mb: 2 }}>{renderChecks(validateResponse.checks)}</Box>

          {/* Metadata row */}
          {(validateResponse.latest_trade_date || validateResponse.latest_technical_date) && (
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              {validateResponse.latest_trade_date && (
                <Chip
                  label={`Latest trade data: ${validateResponse.latest_trade_date}`}
                  size="small"
                  color="default"
                />
              )}
              {validateResponse.latest_technical_date && (
                <Chip
                  label={`Latest technical data: ${validateResponse.latest_technical_date}`}
                  size="small"
                  color="default"
                />
              )}
            </Box>
          )}

          {/* Suggested date */}
          {!validateResponse.can_proceed && validateResponse.suggested_date && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Suggested date:{" "}
              <Box
                component="span"
                sx={{
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
                onClick={() => {
                  setSelectedDate(dayjs(validateResponse.suggested_date!));
                  setValidateResponse(null);
                  setValidateError("");
                }}
              >
                {validateResponse.suggested_date}
              </Box>
              {" "}(click to use)
            </Alert>
          )}

          <Button
            variant="contained"
            disabled={!validateResponse.can_proceed}
            onClick={() => setActiveStep(1)}
            sx={{
              background: validateResponse.can_proceed
                ? "linear-gradient(to right, #4b6cb7, #182848)"
                : undefined,
              color: validateResponse.can_proceed ? "#fff" : undefined,
            }}
          >
            Next: Review & Generate
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderStep2 = () => {
    const reportExists = validateResponse?.checks?.report_exists?.exists === true;
    const reportId = validateResponse?.checks?.report_exists?.passed
      ? undefined
      : undefined;

    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Confirm & Generate
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          Generate CIO Portfolio Review for <strong>{tradeDate}</strong>?
        </Alert>

        {reportExists && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will overwrite the existing report
            {reportId ? ` (ID: ${reportId})` : ""}.
          </Alert>
        )}

        {generating ? (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <CircularProgress size={36} />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Generating CIO report…
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This typically takes 10–20 minutes. Please do not close this page.
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="h5"
              sx={{ fontFamily: "monospace", mb: 2, color: "#4b6cb7" }}
            >
              {formatElapsed(elapsedSeconds)}
            </Typography>

            {/* Progress stepper */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {PROGRESS_STEPS.map((label, i) => (
                <Chip
                  key={label}
                  label={label}
                  size="small"
                  color={
                    i < progressStep
                      ? "success"
                      : i === progressStep
                      ? "primary"
                      : "default"
                  }
                  icon={
                    i < progressStep ? (
                      <CheckCircleIcon style={{ fontSize: 14 }} />
                    ) : undefined
                  }
                />
              ))}
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setActiveStep(0)}
              disabled={generating}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleGenerate}
              sx={{
                background: "linear-gradient(to right, #4b6cb7, #182848)",
                color: "#fff",
              }}
            >
              Generate Report
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  const renderStep3 = () => {
    if (!runResponse) return null;
    const success = runResponse.status === "success";
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {success ? "Report Generated" : "Generation Failed"}
        </Typography>

        {success ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              CIO Portfolio Review generated successfully!
            </Alert>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 3 }}>
              <Chip label={`Report ID: ${runResponse.report_id}`} color="primary" />
              <Chip label={`Total Positions: ${runResponse.total_positions}`} color="default" />
              <Chip
                label={`Processing Time: ${runResponse.processing_time_seconds?.toFixed(0)}s`}
                color="default"
              />
              {runResponse.us_tickers_processed !== undefined && (
                <Chip label={`US Tickers: ${runResponse.us_tickers_processed}`} color="default" />
              )}
              {runResponse.technical_data_records !== undefined && (
                <Chip
                  label={`Technical Records: ${runResponse.technical_data_records}`}
                  color="default"
                />
              )}
              {runResponse.claude_model && (
                <Chip label={runResponse.claude_model} size="small" color="default" />
              )}
            </Box>

            {runResponse.technical_data_missing_tickers &&
              runResponse.technical_data_missing_tickers.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Missing technical data for:{" "}
                  {runResponse.technical_data_missing_tickers.join(", ")}
                </Alert>
              )}

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                href="/ai_portfolio_review"
                sx={{
                  background: "linear-gradient(to right, #4b6cb7, #182848)",
                  color: "#fff",
                }}
              >
                View Report
              </Button>
              <Button variant="outlined" onClick={handleReset}>
                Generate Another
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>
              {runResponse.error || "An unknown error occurred."}
            </Alert>
            {runResponse.raw_response_file && (
              <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                Raw response saved to: <code>{runResponse.raw_response_file}</code>
              </Typography>
            )}
            <Button variant="contained" onClick={handleReset} color="error">
              Try Again
            </Button>
          </>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ backgroundColor: "#f5f7fa", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="md">
        <Typography
          variant="h5"
          align="center"
          sx={{ mb: 4, fontWeight: 700, color: "#182848" }}
        >
          CIO Portfolio Review
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {WIZARD_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper
          elevation={3}
          sx={{ borderRadius: 3, p: 4, background: "#fff" }}
        >
          {activeStep === 0 && renderStep1()}
          {activeStep === 1 && renderStep2()}
          {activeStep === 2 && renderStep3()}
        </Paper>
      </Container>
    </Box>
  );
};

export default CIOPortfolioReviewWizard;
