
import { useEffect } from "react";

type TrendlyneTechnicalWidgetProps = {
  companyCode?: string;
  className?: string;
};

const TRENDLYNE_SCRIPT_ID = "trendlyne-widget-script";

const normalizeCompanyCode = (value?: string) => {
  const cleaned = (value ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return cleaned || null;
};

export default function TrendlyneTechnicalWidget({
  companyCode,
  className,
}: TrendlyneTechnicalWidgetProps) {
  const widgetCompany = normalizeCompanyCode(companyCode);

  useEffect(() => {
    if (!widgetCompany) return;

    const oldScript = document.getElementById(TRENDLYNE_SCRIPT_ID);
    if (oldScript) oldScript.remove();

    const script = document.createElement("script");
    script.id = TRENDLYNE_SCRIPT_ID;
    script.src =
      "https://cdn-static.trendlyne.com/static/js/webwidgets/tl-widgets.js";
    script.async = true;
    script.charset = "utf-8";
    document.body.appendChild(script);

    return () => {
      document.getElementById(TRENDLYNE_SCRIPT_ID)?.remove();
    };
  }, [widgetCompany]);

  if (!widgetCompany) return null;

  return (
    <div className={className} style={{ position: "relative" }}>
      <blockquote
        key={widgetCompany}
        className="trendlyne-widgets"
        data-get-url={`https://us.trendlyne.com/us/web-widget/technical-widget/Poppins/${widgetCompany}/?posCol=00A25B&primaryCol=006AFF&negCol=EB3B00&neuCol=F7941E`}
        data-theme="light"
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: 8,
          bottom: 8,
          width: 48,
          height: 40,
          background: "#fff",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
