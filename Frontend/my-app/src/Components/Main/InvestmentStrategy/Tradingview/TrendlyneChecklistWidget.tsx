import { useEffect } from "react";

type TrendlyneChecklistWidgetProps = {
  companyCode?: string;
  className?: string;
  companyName: string;
};

const TRENDLYNE_SCRIPT_ID = "trendlyne-widget-script";

const normalizeCompanyCode = (value?: string) => {
  const cleaned = (value ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return cleaned || null;
};

export default function TrendlyneChecklistWidget({
  companyCode,
  className,
  companyName,
}: TrendlyneChecklistWidgetProps) {
  const widgetCompany = normalizeCompanyCode(companyCode);

  // 💾 Cache working Trendlyne ticker
  useEffect(() => {
    if (widgetCompany && companyName) {
      localStorage.setItem(
        `tl_code_${companyName}`,
        widgetCompany
      );
    }
  }, [widgetCompany, companyName]);

  // Load Trendlyne script once
  useEffect(() => {
    if (!widgetCompany) return;
    if (document.getElementById(TRENDLYNE_SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = TRENDLYNE_SCRIPT_ID;
    script.src =
      "https://cdn-static.trendlyne.com/static/js/webwidgets/tl-widgets.js";
    script.async = true;
    script.charset = "utf-8";
    document.body.appendChild(script);
  }, [widgetCompany]);

  if (!widgetCompany) return null;

  return (
    <div className={className} style={{ position: "relative" }}>
      <blockquote
        className="trendlyne-widgets"
        data-get-url={`https://us.trendlyne.com/us/web-widget/checklist-widget/Poppins/${widgetCompany}/?posCol=00A25B&primaryCol=006AFF&negCol=EB3B00&neuCol=F7941E`}
        data-theme="light"
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: 8,
          bottom: 8,
          width: 48,
          height: 32,
          background: "#fff",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
