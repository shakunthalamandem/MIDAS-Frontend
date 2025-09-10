import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  IconButton,
  TextField,
  Divider,
  Tooltip,
  LinearProgress,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircle from "@mui/icons-material/CheckCircle";
import ErrorOutline from "@mui/icons-material/ErrorOutline";

interface ValuationWriteup {
  future_outlook?: string;
  company_overview?: string;
  recent_developments?: string;
}

interface ValuationWriteupProps {
  // You are passing formData.valuation_writeup here
  selectedData?: ValuationWriteup;
  ticker: string;
}

type SectionKey = keyof ValuationWriteup;

const SECTION_ORDER: { key: SectionKey; title: string }[] = [
  { key: "company_overview", title: "Company Overview" },
  { key: "recent_developments", title: "Recent Developments" },
    { key: "future_outlook", title: "Future Outlook" },

];

const FOValuationWriteup: React.FC<ValuationWriteupProps> = ({
  selectedData,
  ticker,
}) => {
  const vw = selectedData;
  const [values, setValues] = useState<ValuationWriteup>({
    future_outlook: vw?.future_outlook || "",
    company_overview: vw?.company_overview || "",
    recent_developments: vw?.recent_developments || "",
  });

  const [editing, setEditing] = useState<Record<SectionKey, boolean>>({
    future_outlook: false,
    company_overview: false,
    recent_developments: false,
  });
  const [loading, setLoading] = useState<Record<SectionKey, boolean>>({
    future_outlook: false,
    company_overview: false,
    recent_developments: false,
  });
  const [status, setStatus] = useState<
    Record<SectionKey, "idle" | "success" | "error">
  >({
    future_outlook: "idle",
    company_overview: "idle",
    recent_developments: "idle",
  });

  const refs = {
    future_outlook: useRef<HTMLInputElement | null>(null),
    company_overview: useRef<HTMLInputElement | null>(null),
    recent_developments: useRef<HTMLInputElement | null>(null),
  };

  useEffect(() => {
    setValues({
      future_outlook: vw?.future_outlook || "",
      company_overview: vw?.company_overview || "",
      recent_developments: vw?.recent_developments || "",
    });
  }, [vw?.future_outlook, vw?.company_overview, vw?.recent_developments]);

  useEffect(() => {
    (Object.keys(editing) as SectionKey[]).forEach((k) => {
      if (editing[k] && refs[k].current) refs[k].current!.focus();
    });
  }, [
    editing.future_outlook,
    editing.company_overview,
    editing.recent_developments,
  ]);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = useMemo(() => localStorage.getItem("access_token"), []);

  // If absolutely nothing is available, you can return null or still render an empty card.
  if (!vw) return null;

  const startEdit = (key: SectionKey) => {
    setEditing((prev) => ({ ...prev, [key]: true }));
    setStatus((prev) => ({ ...prev, [key]: "idle" }));
  };

  const handleChange = (key: SectionKey, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (key: SectionKey) => {
    if (!apiUrl) return;
    setLoading((p) => ({ ...p, [key]: true }));
    setStatus((p) => ({ ...p, [key]: "idle" }));

    try {
      const payload: Record<string, any> = { ticker };
      payload[key] = values[key];

      const resp = await fetch(`${apiUrl}/api/fo_writeup_data/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error("Update failed");
      setEditing((p) => ({ ...p, [key]: false }));
      setStatus((p) => ({ ...p, [key]: "success" }));
    } catch {
      setStatus((p) => ({ ...p, [key]: "error" }));
    } finally {
      setLoading((p) => ({ ...p, [key]: false }));
      setTimeout(() => setStatus((p) => ({ ...p, [key]: "idle" })), 1600);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <Card
          sx={{
            borderRadius: 4,
            background: "linear-gradient(#f7faff, #f0f5ff)",
            boxShadow: "0 12px 28px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: "#0b3954",
                textAlign: "center",
                mb: 1,
                letterSpacing: 0.2,
              }}
            >
              Valuation
            </Typography>

            <Divider sx={{ my: 1.5 }} />

            <Stack spacing={2.5}>
              {SECTION_ORDER.map(({ key, title }, i) => {
                const isEditing = editing[key];
                const isLoading = loading[key];
                const state = status[key];

                return (
                  <Box
                    key={key}
                    sx={{
                      p: { xs: 1, md: 1.5 },
                      borderRadius: 3,
                      background: isEditing
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.6)",
                      border: "1px solid rgba(0,0,0,0.06)",
                      boxShadow: isEditing
                        ? "0 6px 14px rgba(0,0,0,0.06)"
                        : "none",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, color: "#026269", flexGrow: 1 }}
                      >
                        {i + 1}. {title}
                      </Typography>

                      {state === "success" && (
                        <Tooltip title="Saved">
                          <CheckCircle
                            fontSize="small"
                            sx={{ color: "#1e7f34" }}
                          />
                        </Tooltip>
                      )}
                      {state === "error" && (
                        <Tooltip title="Failed to save">
                          <ErrorOutline fontSize="small" color="error" />
                        </Tooltip>
                      )}

                      <Tooltip title={isEditing ? "Save" : "Edit"}>
                        <span>
                          <IconButton
                            onClick={() =>
                              isEditing ? handleSave(key) : startEdit(key)
                            }
                            disabled={isLoading}
                            sx={{ color: "#002060" }}
                            size="small"
                          >
                            {isEditing ? <SaveIcon /> : <EditIcon />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>

                    {isLoading && (
                      <LinearProgress sx={{ my: 1, borderRadius: 1 }} />
                    )}

                    <Box mt={1}>
                      {isEditing ? (
                        <TextField
                          inputRef={refs[key]}
                          multiline
                          fullWidth
                          minRows={5}
                          value={values[key] || ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                          disabled={isLoading}
                          variant="outlined"
                          placeholder={`Write ${title.toLowerCase()}...`}
                          sx={{
                            "& .MuiOutlinedInput-root": { background: "#fff" },
                          }}
                        />
                      ) : (
                        <Typography
                          component="div"
                          sx={{
                            color: "#333",
                            lineHeight: 1.8,
                            fontSize: "1.05rem",
                            whiteSpace: "pre-line",
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              display: "inline-block",
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "#128080",
                              mr: 1.5,
                              position: "relative",
                              top: -1,
                            }}
                          />
                          {values[key] || "—"}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default FOValuationWriteup;
