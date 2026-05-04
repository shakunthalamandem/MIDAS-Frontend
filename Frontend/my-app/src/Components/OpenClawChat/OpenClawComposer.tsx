import React, { useRef } from "react";
import { Box, IconButton, TextField, Tooltip } from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  sending: boolean;
  disabled?: boolean;
}

const OpenClawComposer: React.FC<Props> = ({
  value,
  onChange,
  onSend,
  onStop,
  sending,
  disabled,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (!sending && value.trim()) onSend();
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2 },
        py: { xs: 1, sm: 1.25 },
        borderTop: "1px solid rgba(15, 23, 42, 0.08)",
        backgroundColor: "#ffffff",
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: 1,
          backgroundColor: "#f1f5f9",
          borderRadius: 3,
          px: 1.25,
          py: 0.75,
          border: "1px solid transparent",
          transition: "border-color 0.15s, background-color 0.15s",
          "&:focus-within": {
            borderColor: "#1e3a8a",
            backgroundColor: "#ffffff",
          },
        }}
      >
        <TextField
          inputRef={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask OpenClaw anything — MDTA, MSS, MGA, or run a task…"
          multiline
          maxRows={6}
          variant="standard"
          fullWidth
          disabled={disabled}
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: { xs: 14, sm: 14.5 },
              lineHeight: 1.5,
              py: 0.25,
            },
          }}
        />
        {sending ? (
          <Tooltip title="Stop generating">
            <IconButton
              onClick={onStop}
              sx={{
                backgroundColor: "#ef4444",
                color: "#fff",
                width: 38,
                height: 38,
                "&:hover": { backgroundColor: "#dc2626" },
              }}
            >
              <StopRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Send (Enter)">
            <span>
              <IconButton
                onClick={onSend}
                disabled={disabled || !value.trim()}
                sx={{
                  backgroundColor: "#1e3a8a",
                  color: "#fff",
                  width: 38,
                  height: 38,
                  "&:hover": { backgroundColor: "#172554" },
                  "&.Mui-disabled": {
                    backgroundColor: "#cbd5e1",
                    color: "#f8fafc",
                  },
                }}
              >
                <SendRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default OpenClawComposer;
