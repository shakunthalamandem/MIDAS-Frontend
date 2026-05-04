import React, { memo, useEffect, useRef, useState } from "react";
import { Box, CircularProgress, IconButton, Tooltip, Typography, Dialog } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckIcon from "@mui/icons-material/CheckOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { OpenClawMessage } from "./openclawTypes";
import { fetchOpenClawFileBlob, isOpenClawProxiedFile } from "./openclawApi";

interface Props {
  message: OpenClawMessage;
  isLastAssistant?: boolean;
}

const FILE_EXT_RE = /\.(pdf|xlsx?|csv|tsv|docx?|pptx?|zip|txt|json|png|jpg|jpeg|gif|svg|webp|html?|md|rtf)$/i;
const IMAGE_EXT_RE = /\.(png|jpe?g|gif|svg|webp)$/i;
const ABS_URL_RE = /^(https?:|mailto:|tel:|data:)/i;

const API_BASE: string =
  (process.env.REACT_APP_API_URL as string) || "";

function fileNameFromUrl(url: string): string {
  try {
    const clean = url.split("?")[0].split("#")[0];
    return decodeURIComponent(clean.split("/").pop() || url);
  } catch {
    return url;
  }
}

/**
 * If `href` looks like a local OpenClaw file reference (relative or absolute
 * filesystem path), rewrite it to hit the Django file-proxy endpoint so it
 * actually loads instead of being intercepted by React Router.
 */
function rewriteFileHref(href: string): string {
  if (!href) return href;
  if (ABS_URL_RE.test(href)) return href; // already a real URL
  if (href.startsWith("/api/")) return `${API_BASE}${href}`;
  // Treat anything else (bare filename, /Users/... path, ~/...) as an
  // OpenClaw workspace ref and proxy it.
  return `${API_BASE}/api/openclaw_chat/file/?ref=${encodeURIComponent(href)}`;
}

const FileCard: React.FC<{ href: string; label?: string }> = ({ href, label }) => {
  const name = label || fileNameFromUrl(href);
  const proxied = isOpenClawProxiedFile(href);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadProxiedFile = async (e: React.MouseEvent) => {
    if (!proxied) return; // external URLs: let the browser handle natively
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const { blobUrl, filename } = await fetchOpenClawFileBlob(href);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename || fileNameFromUrl(href);
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Free the blob after the browser has had time to start the download.
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
    } catch (err: any) {
      setError(err?.message || "Could not download file.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={downloadProxiedFile}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1.25,
        px: 1.5,
        py: 1,
        my: 0.5,
        borderRadius: 2,
        border: error
          ? "1px solid rgba(239, 68, 68, 0.4)"
          : "1px solid rgba(15, 23, 42, 0.12)",
        backgroundColor: error
          ? "rgba(254, 226, 226, 0.6)"
          : "rgba(15, 23, 42, 0.04)",
        color: "inherit",
        textDecoration: "none",
        maxWidth: "100%",
        cursor: busy ? "wait" : "pointer",
        transition: "all 0.15s",
        "&:hover": {
          backgroundColor: error ? "rgba(254, 226, 226, 0.8)" : "rgba(15, 23, 42, 0.08)",
          borderColor: error ? "rgba(239, 68, 68, 0.5)" : "rgba(15, 23, 42, 0.2)",
        },
      }}
    >
      <InsertDriveFileOutlinedIcon fontSize="small" sx={{ color: "#1e3a8a" }} />
      <Box sx={{ overflow: "hidden" }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: { xs: 180, sm: 280 },
          }}
        >
          {name}
        </Typography>
        <Typography variant="caption" sx={{ color: error ? "error.main" : "text.secondary" }}>
          {error ? error : busy ? "Downloading…" : "Click to download"}
        </Typography>
      </Box>
      {busy ? (
        <CircularProgress size={16} sx={{ ml: 0.5 }} />
      ) : (
        <DownloadOutlinedIcon fontSize="small" sx={{ ml: 0.5, color: "text.secondary" }} />
      )}
    </Box>
  );
};

const ImageWithLightbox: React.FC<{ src: string; alt?: string }> = ({ src, alt }) => {
  const [open, setOpen] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string>(
    isOpenClawProxiedFile(src) ? "" : src
  );
  const [failed, setFailed] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpenClawProxiedFile(src)) {
      setResolvedSrc(src);
      return;
    }
    let cancelled = false;
    setFailed(false);
    setResolvedSrc("");
    fetchOpenClawFileBlob(src)
      .then(({ blobUrl }) => {
        if (cancelled) {
          URL.revokeObjectURL(blobUrl);
          return;
        }
        blobUrlRef.current = blobUrl;
        setResolvedSrc(blobUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [src]);

  if (failed) {
    return (
      <Typography variant="caption" color="error" sx={{ display: "block", my: 0.5 }}>
        Could not load image: {fileNameFromUrl(src)}
      </Typography>
    );
  }

  if (!resolvedSrc) {
    return (
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, my: 0.5 }}>
        <CircularProgress size={14} />
        <Typography variant="caption" color="text.secondary">
          Loading image…
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        component="img"
        src={resolvedSrc}
        alt={alt || ""}
        loading="lazy"
        onClick={() => setOpen(true)}
        sx={{
          maxWidth: "100%",
          maxHeight: 360,
          borderRadius: 1.5,
          cursor: "zoom-in",
          display: "block",
          my: 0.5,
        }}
      />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg">
        <Box
          component="img"
          src={resolvedSrc}
          alt={alt || ""}
          sx={{ maxWidth: "90vw", maxHeight: "90vh", display: "block" }}
        />
      </Dialog>
    </>
  );
};

const CodeBlock: React.FC<{ language?: string; value: string }> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    });
  };
  return (
    <Box
      sx={{
        position: "relative",
        my: 1,
        borderRadius: 1.5,
        overflow: "hidden",
        border: "1px solid rgba(15, 23, 42, 0.12)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.25,
          py: 0.5,
          backgroundColor: "#0f172a",
          color: "#cbd5f5",
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.6 }}>
          {(language || "text").toUpperCase()}
        </Typography>
        <Tooltip title={copied ? "Copied" : "Copy"}>
          <IconButton size="small" onClick={copy} sx={{ color: "#cbd5f5" }}>
            {copied ? <CheckIcon fontSize="inherit" /> : <ContentCopyIcon fontSize="inherit" />}
          </IconButton>
        </Tooltip>
      </Box>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark as any}
        customStyle={{
          margin: 0,
          padding: "12px 14px",
          fontSize: 12.5,
          background: "#0f172a",
        }}
        wrapLongLines
      >
        {value}
      </SyntaxHighlighter>
    </Box>
  );
};

const OpenClawMessageBubble: React.FC<Props> = ({ message, isLastAssistant }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const ts = message.created_at ? dayjs(message.created_at).format("HH:mm") : "";

  const copyAll = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    });
  };

  const BRAND_NAVY = "#1e3a8a";
  const bubbleBg = message.error
    ? "#fee2e2"
    : isUser
      ? BRAND_NAVY
      : "#ffffff";
  const bubbleColor = message.error ? "#991b1b" : isUser ? "#ffffff" : "#0f172a";
  const border = message.error
    ? "1px solid #fecaca"
    : isUser
      ? "none"
      : "1px solid rgba(15, 23, 42, 0.08)";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        px: { xs: 1, sm: 2 },
        mb: 1,
        "&:hover .openclaw-copy-btn": { opacity: 1 },
      }}
    >
      <Box
        sx={{
          maxWidth: { xs: "88%", sm: "78%" },
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
        }}
      >
        <Box
          sx={{
            position: "relative",
            px: 1.75,
            py: 1.25,
            borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            backgroundColor: bubbleBg,
            color: bubbleColor,
            border,
            boxShadow: isUser
              ? "0 1px 2px rgba(30, 58, 138, 0.28)"
              : "0 1px 2px rgba(15, 23, 42, 0.06)",
            wordBreak: "break-word",
            lineHeight: 1.55,
            fontSize: { xs: 14, sm: 14.5 },
            "& p": { my: 0.4 },
            "& p:first-of-type": { mt: 0 },
            "& p:last-of-type": { mb: 0 },
            "& ul, & ol": { my: 0.5, pl: 3 },
            "& li": { mb: 0.25 },
            "& a": {
              color: isUser ? "#bfdbfe" : BRAND_NAVY,
              textDecoration: "underline",
            },
            "& h1, & h2, & h3": { mt: 1, mb: 0.5, fontWeight: 700 },
            "& h1": { fontSize: "1.1rem" },
            "& h2": { fontSize: "1.05rem" },
            "& h3": { fontSize: "1rem" },
            "& blockquote": {
              borderLeft: isUser
                ? "3px solid rgba(255,255,255,0.5)"
                : `3px solid ${BRAND_NAVY}`,
              pl: 1.25,
              my: 0.75,
              color: isUser ? "rgba(255,255,255,0.9)" : "text.secondary",
            },
            "& hr": { my: 1, border: 0, borderTop: "1px solid rgba(15,23,42,0.12)" },
            "& table": {
              borderCollapse: "collapse",
              my: 0.75,
              fontSize: 13,
              display: "block",
              overflowX: "auto",
              maxWidth: "100%",
            },
            "& th, & td": {
              border: "1px solid rgba(15, 23, 42, 0.12)",
              px: 1,
              py: 0.5,
              textAlign: "left",
            },
            "& th": {
              backgroundColor: isUser ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.05)",
              fontWeight: 600,
            },
            "& code": {
              background: isUser ? "rgba(255,255,255,0.18)" : "rgba(15,23,42,0.06)",
              px: 0.5,
              py: 0.15,
              borderRadius: 0.75,
              fontSize: "0.85em",
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            },
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm as any]}
            components={{
              a({ href, children, ...rest }) {
                const original = href || "";
                const url = rewriteFileHref(original);
                const text = String(children);
                if (original && IMAGE_EXT_RE.test(original)) {
                  return <ImageWithLightbox src={url} alt={text} />;
                }
                if (original && FILE_EXT_RE.test(original)) {
                  return <FileCard href={url} label={text} />;
                }
                return (
                  <a href={url} target="_blank" rel="noopener noreferrer" {...rest}>
                    {children}
                    <OpenInNewOutlinedIcon
                      fontSize="inherit"
                      sx={{ ml: 0.25, verticalAlign: "-2px", fontSize: "0.85em" }}
                    />
                  </a>
                );
              },
              img({ src, alt }) {
                if (!src) return null;
                return <ImageWithLightbox src={rewriteFileHref(String(src))} alt={alt} />;
              },
              code({ inline, className, children, ...rest }: any) {
                const raw = String(children).replace(/\n$/, "");
                if (inline) {
                  return (
                    <code className={className} {...rest}>
                      {children}
                    </code>
                  );
                }
                const lang = /language-(\w+)/.exec(className || "")?.[1];
                return <CodeBlock language={lang} value={raw} />;
              },
              table({ children }) {
                return (
                  <Box sx={{ overflowX: "auto", my: 0.75 }}>
                    <table>{children}</table>
                  </Box>
                );
              },
            }}
          >
            {message.content || (message.streaming ? "…" : "")}
          </ReactMarkdown>

          {!isUser && message.content && !message.streaming && (
            <Tooltip title={copied ? "Copied" : "Copy"}>
              <IconButton
                className="openclaw-copy-btn"
                size="small"
                onClick={copyAll}
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  opacity: 0,
                  transition: "opacity 0.15s",
                  color: "text.secondary",
                  "@media (hover: none)": { opacity: 1 },
                }}
              >
                {copied ? <CheckIcon fontSize="inherit" /> : <ContentCopyIcon fontSize="inherit" />}
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {ts && (
          <Typography
            variant="caption"
            sx={{
              mt: 0.3,
              px: 0.5,
              fontSize: 10.5,
              color: "text.secondary",
            }}
          >
            {ts}
            {isUser && !message.pending && " · ✓"}
            {isUser && message.pending && " · …"}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default memo(OpenClawMessageBubble);
