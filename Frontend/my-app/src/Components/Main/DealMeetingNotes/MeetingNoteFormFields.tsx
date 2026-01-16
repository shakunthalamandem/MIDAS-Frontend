import React from "react";
import { Checkbox, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { checkboxSx, headingColor, readOnlyFieldSx, uiFontFamily } from "./MeetingNoteFormShared";

type FieldOptions = {
  multiline?: boolean;
  type?: string;
  readOnly?: boolean;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
};

type LabeledTextFieldProps = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  isEditing: boolean;
  options?: FieldOptions;
};

export const LabeledTextField: React.FC<LabeledTextFieldProps> = ({
  label,
  value,
  onChange,
  isEditing,
  options,
}) => (
  <Stack spacing={0.5}>
    <Typography fontWeight={600} color={headingColor} sx={{ fontFamily: uiFontFamily }}>
      {label}
      {options?.required ? " *" : ""}
    </Typography>
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      size="small"
      multiline={options?.multiline}
      minRows={options?.multiline ? 2 : undefined}
      type={options?.type}
      InputProps={{
        readOnly: !isEditing || options?.readOnly,
        sx: { fontFamily: uiFontFamily },
      }}
      placeholder={options?.placeholder}
      required={options?.required}
      error={options?.error}
      helperText={options?.helperText}
      disabled={options?.readOnly}
      sx={{
        ...readOnlyFieldSx,
        "& .MuiInputBase-input": {
          fontFamily: uiFontFamily,
        },
      }}
    />
  </Stack>
);

type LabeledMultiSelectFieldProps = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  isEditing: boolean;
};

export const LabeledMultiSelectField: React.FC<LabeledMultiSelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  isEditing,
}) => {
  const selectedValues = value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return (
    <Stack spacing={0.5}>
      <Typography fontWeight={600} color={headingColor} sx={{ fontFamily: uiFontFamily }}>
        {label}
      </Typography>
      <TextField
        select
        value={selectedValues}
        onChange={(e) => {
          const next = Array.isArray(e.target.value) ? e.target.value : [];
          onChange(next.join(", "));
        }}
        SelectProps={{ multiple: true }}
        fullWidth
        size="small"
        disabled={!isEditing}
        sx={{
          ...readOnlyFieldSx,
          "& .MuiInputBase-input": {
            fontFamily: uiFontFamily,
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={selectedValues.includes(option)} sx={checkboxSx} />
            {option}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
};
