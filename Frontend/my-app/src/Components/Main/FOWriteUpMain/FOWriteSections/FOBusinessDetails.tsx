import React, { useEffect, useMemo, useState } from "react";
import { Container, Grid } from "@mui/material";
import { motion } from "framer-motion";
import SectionCard from "./FOComparisionData/SectionCard";
import { BusinessDetails, SECTION_ORDER, SectionKey } from "./FOComparisionData/Businessdetailstypes";

interface FOBusinessDetailsProps {
  selectedData?: BusinessDetails;
  ticker: string;
}

const FOBusinessDetails: React.FC<FOBusinessDetailsProps> = ({
  selectedData,
  ticker,
}) => {
  const bd = selectedData;

  const [values, setValues] = useState<Record<SectionKey, string[]>>({
    strengths: bd?.strengths ? bd.strengths.split("\n") : [],
    weakness: bd?.weakness ? bd.weakness.split("\n") : [],
    management: bd?.management ? bd.management.split("\n") : [],
    business_highlights: bd?.business_highlights
      ? bd.business_highlights.split("\n")
      : [],
  });

  const [editing, setEditing] = useState<Record<SectionKey, boolean>>({
    strengths: false,
    weakness: false,
    management: false,
    business_highlights: false,
  });

  const [loading, setLoading] = useState<Record<SectionKey, boolean>>({
    strengths: false,
    weakness: false,
    management: false,
    business_highlights: false,
  });

  const [status, setStatus] = useState<
    Record<SectionKey, "idle" | "success" | "error">
  >({
    strengths: "idle",
    weakness: "idle",
    management: "idle",
    business_highlights: "idle",
  });

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = useMemo(() => localStorage.getItem("access_token"), []);

  useEffect(() => {
    setValues({
      strengths: bd?.strengths ? bd.strengths.split("\n") : [],
      weakness: bd?.weakness ? bd.weakness.split("\n") : [],
      management: bd?.management ? bd.management.split("\n") : [],
      business_highlights: bd?.business_highlights
        ? bd.business_highlights.split("\n")
        : [],
    });
  }, [bd]);

  const startEdit = (key: SectionKey) => {
    setEditing((prev) => ({ ...prev, [key]: true }));
    setStatus((prev) => ({ ...prev, [key]: "idle" }));
  };

  const handleAddSentence = (key: SectionKey) => {
    setValues((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  };

  const handleRemoveSentence = (key: SectionKey, index: number) => {
    setValues((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const handleChange = (key: SectionKey, index: number, val: string) => {
    setValues((prev) => ({
      ...prev,
      [key]: prev[key].map((s, i) => (i === index ? val : s)),
    }));
  };

  const handleSave = async (key: SectionKey) => {
    if (!apiUrl) return;
    setLoading((p) => ({ ...p, [key]: true }));
    setStatus((p) => ({ ...p, [key]: "idle" }));

    try {
      const payload: Record<string, any> = { ticker };
      payload[key] = values[key].join("\n");

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

  if (!bd) return null;

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <Grid container spacing={2}>
          {SECTION_ORDER.map(({ key, title }) => (
            <Grid item xs={12} md={6} key={key}>
              <SectionCard
                title={title}
                values={values[key]}
                isEditing={editing[key]}
                isLoading={loading[key]}
                status={status[key]}
                onEdit={() => startEdit(key)}
                onSave={() => handleSave(key)}
                onChange={(index, val) => handleChange(key, index, val)}
                onAdd={() => handleAddSentence(key)}
                onRemove={(index) => handleRemoveSentence(key, index)}
              />
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Container>
  );
};

export default FOBusinessDetails;
