import React, { useEffect, useMemo, useState } from "react";
import { Grid, TextField, Button, Stack } from "@mui/material";
import { SectionCard } from "./SectionCard";

export function ValuationCard({
  value,
  onChange,
  onSave,
  saving,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  saving?: boolean;
}) {
  return (
    <SectionCard title="Valuation (Editable)">
      <Stack spacing={2}>
        <TextField
          label="Valuation Summary"
          multiline
          minRows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
        />
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button variant="contained" onClick={onSave} disabled={!!saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </Stack>
      </Stack>
    </SectionCard>
  );
}
