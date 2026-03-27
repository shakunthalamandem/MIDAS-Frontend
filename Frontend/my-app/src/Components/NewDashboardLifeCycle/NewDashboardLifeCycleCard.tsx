import React from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedOutlinedIcon from "@mui/icons-material/RadioButtonUncheckedOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { NewDashboardLifeCycleCardTag } from "./NewDashboardLifeCycleUtils";

export type NewDashboardLifeCycleCardMeta = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

type NewDashboardLifeCycleCardProps = {
  title: string;
  subtitle?: string;
  meta: NewDashboardLifeCycleCardMeta[];
  tags?: NewDashboardLifeCycleCardTag[];
  writeupAvailable?: boolean | null;
  mlPredAvailable?: boolean | null;
  multipleDealStatus?: string;
  onViewDetails?: () => void;
  onActionClick?: (label: string) => void;
};

const NewDashboardLifeCycleCard: React.FC<NewDashboardLifeCycleCardProps> = ({
  title,
  subtitle,
  meta,
  tags,
  writeupAvailable,
  mlPredAvailable,
  multipleDealStatus,
  onViewDetails,
  onActionClick,
}) => {
  const isMultipleDeal =
    multipleDealStatus?.trim().toLowerCase() === "yes";

  const pickMeta = (pattern: RegExp, fallbackLabel: string) =>
    meta.find((item) => pattern.test(item.label)) ?? {
      label: fallbackLabel,
      value: "TBA",
      icon: null,
    };

  const displayMeta: NewDashboardLifeCycleCardMeta[] = [
    pickMeta(/deal size/i, "Deal Size"),
    pickMeta(/price range/i, "Price Range"),
    pickMeta(/pricing date/i, "Pricing Date"),
    pickMeta(/first trade date|trade date/i, "First Trade Date"),
  ];

  const statusItems = [
    {
      actionLabel: "Write Up",
      label: "Write Up",
      value:
        writeupAvailable === true
          ? "Ready"
          : writeupAvailable === false
          ? "Not Ready"
          : "Pending",
      positive: writeupAvailable === true,
      actionEnabled: writeupAvailable === true,
    },
    {
      actionLabel: "ML Model",
      label: "ML",
      value: mlPredAvailable === true ? "Completed": "Pending",
      positive: mlPredAvailable === true,
      actionEnabled: true,
    },
  ];
  const sectorText = tags?.[0]?.label?.trim();
  const onActionItemClick = (
    actionLabel: string,
    actionEnabled: boolean,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    if (actionEnabled) {
      onActionClick?.(actionLabel);
    }
  };

  const onActionItemKeyDown = (
    actionLabel: string,
    actionEnabled: boolean,
    event: React.KeyboardEvent
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      if (actionEnabled) {
        onActionClick?.(actionLabel);
      }
    }
  };

  const handleViewClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onViewDetails?.();
  };

  const handleViewKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      onViewDetails?.();
    }
  };

  return (
    <Card
      elevation={0}
      onClick={onViewDetails}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 3,
        border: "1px solid #d9e4f3",
        backgroundColor: "#ffffff",
        boxShadow: "0 10px 20px rgba(15, 33, 72, 0.1)",
        height: "100%",
        minHeight: { xs: 365, sm: 380 },
        cursor: onViewDetails ? "pointer" : "default",
        transition:
          "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
        willChange: "transform, box-shadow",
        "&:hover": onViewDetails
          ? {
              transform: "translateY(-3px)",
              borderColor: "#bfd2f0",
              boxShadow: "0 14px 26px rgba(15, 33, 72, 0.15)",
            }
          : undefined,
        "&:focus-visible": onViewDetails
          ? {
              outlineOffset: 2,
            }
          : undefined,
      }}
    >
      <CardContent
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap:3.5,
          p: { xs: 2, sm: 2.2 },
        }}
      >
        <Box sx={{ minWidth: 0, pt: 0.8, position: "relative" }}>
          {isMultipleDeal && (
            <Typography
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "#e67e22",
                lineHeight: 1,
              }}
            >
              After Market
            </Typography>
          )}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "#15284d",
              letterSpacing: 0.25,
              wordBreak: "break-word",
              fontSize: "clamp(1.08rem, 1.55vw, 1.35rem)",
              lineHeight: 1.15,
            }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                color: "#334f77",
                fontWeight: 500,
                fontSize: "0.83rem",
                wordBreak: "break-word",
                lineHeight: 1.3,
              }}
            >
              {subtitle}
            </Typography>
          ) : null}
          {sectorText ? (
            <Box
              sx={{
                mt: 0.9,
                display: "inline-flex",
                alignItems: "center",
                px: 1.1,
                py: 0.38,
                borderRadius: 999,
                border: "1px solid #d4def0",
                backgroundColor: "#eef4ff",
                color: "#2f4f84",
                fontSize: "0.72rem",
                fontWeight: 700,
                lineHeight: 1,
                maxWidth: "100%",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {sectorText}
            </Box>
          ) : null}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 0.8,
          }}
        >
          {statusItems.map((item) => {
            const interactive = Boolean(onActionClick) && item.actionEnabled;
            return (
              <Box
                key={item.actionLabel}
                onClick={(event) =>
                  onActionItemClick(item.actionLabel, item.actionEnabled, event)
                }
                onKeyDown={(event) =>
                  onActionItemKeyDown(item.actionLabel, item.actionEnabled, event)
                }
                role={interactive ? "button" : undefined}
                tabIndex={interactive ? 0 : -1}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.4,
                  px: 0.7,
                  py: 0.48,
                  borderRadius: 999,
                  border: "1px solid #d9e5f4",
                  backgroundColor: item.positive ? "#eefbf3" : "#f4f7fb",
                  color: item.positive ? "#0f8a55" : "#5f6f87",
                  cursor: interactive ? "pointer" : "default",
                  transition: "all 180ms ease",
                  "&:hover": interactive
                    ? {
                        transform: "translateY(-1px)",
                        borderColor: "#b5cced",
                        boxShadow: "0 6px 12px rgba(14, 57, 117, 0.12)",
                        backgroundColor: "#e8f7ef",
                      }
                    : undefined,
                }}
              >
                {item.positive ? (
                  <CheckCircleOutlinedIcon sx={{ fontSize: 17 }} />
                ) : (
                  <RadioButtonUncheckedOutlinedIcon sx={{ fontSize: 16 }} />
                )}
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#3b4b66",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}:
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.79rem",
                    fontWeight: 800,
                    color: item.positive ? "#156f49" : "#4f607a",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ borderColor: "#d7e3f4" }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            columnGap: 1.6,
            rowGap: 1.15,
          }}
        >
          {displayMeta.map((item) => (
            <Box key={item.label}>
              <Typography
                sx={{
                  color: "#4b5e7b",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  letterSpacing: "0.08em",
                }}
              >
                {item.label}
              </Typography>
              <Typography
                sx={{
                  mt: 0.15,
                  color: "#15284d",
                  fontWeight: 700,
                  fontSize: "clamp(1.02rem, 1.35vw, 1.12rem)",
                  lineHeight: 1.25,
                  wordBreak: "break-word",
                }}
              >
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {onViewDetails && (
          <Box
            onClick={handleViewClick}
            onKeyDown={handleViewKeyDown}
            role="button"
            tabIndex={0}
            aria-label="View details"
            sx={{
              mt: "auto",
              alignSelf: "flex-end",
              minHeight: 30,
              borderRadius: 1.4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.45,
              px: 0.4,
              color: "#0d2f6d",
              background: "transparent",
              boxShadow: "none",
              transition:
                "transform 180ms ease, box-shadow 180ms ease, filter 180ms ease",
              "&:hover": {
                transform: "translateY(-1px)",
                color: "#0a285c",
              },
            }}
          >
            <Typography sx={{ fontSize: "1.02rem", fontWeight: 700 }}>
              View
            </Typography>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                backgroundColor: "#123b82",
                color: "#ffffff",
                boxShadow: "0 4px 10px rgba(18, 59, 130, 0.22)",
              }}
            >
              <ArrowForwardIcon sx={{ fontSize: 15 }} />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default NewDashboardLifeCycleCard;
