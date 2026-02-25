import React from "react";

const actionStyles: Record<string, string> = {
  buy: "bg-buy/10 text-buy border border-buy/30",
  hold: "bg-hold/10 text-hold border border-hold/30",
  reduce: "bg-reduce/10 text-reduce border border-reduce/30",
  sell: "bg-sell/10 text-sell border border-sell/30",
};

interface ActionBadgeProps {
  action: string;
}

export const ActionBadge: React.FC<ActionBadgeProps> = ({ action }) => {
  const normalized = action?.toLowerCase().trim() ?? "";
  const classes = actionStyles[normalized] ?? "bg-muted/20 text-muted-foreground border border-muted/40";

  return (
    <span
      className={`text-[10px] font-semibold uppercase tracking-[0.3em] px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${classes}`}
    >
      {action}
    </span>
  );
};
