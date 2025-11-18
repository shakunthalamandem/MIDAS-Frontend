export const gridItemProps = { xs: 12, sm: 6, md: 3 };

export const inputLabelSx = { color: "#1d2b54", fontWeight: 600 };

export const baseTextFieldProps = {
  variant: "standard" as const,
  fullWidth: true,
  InputLabelProps: {
    shrink: true,
    sx: inputLabelSx,
  },
};

export const selectMenuProps = {
  PaperProps: {
    style: {
      maxHeight: 240,
    },
  },
};
