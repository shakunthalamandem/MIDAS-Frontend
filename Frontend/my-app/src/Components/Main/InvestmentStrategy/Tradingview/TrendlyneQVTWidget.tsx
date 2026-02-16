import { useEffect } from "react";

type TrendlyneQVTWidgetProps = {
  companyCode?: string;
  className?: string;
  companyName: string;
};

const TRENDLYNE_SCRIPT_ID = "trendlyne-widget-script";

const normalizeCompanyCode = (value?: string) => {
  const cleaned = (value ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return cleaned || null;
};

export default function TrendlyneQVTWidget({
  companyCode,
  className,
  companyName,
}: TrendlyneQVTWidgetProps) {

  const widgetCompany = normalizeCompanyCode(companyCode);

  useEffect(() => {
    if (widgetCompany && companyName) {
      localStorage.setItem(
        `tl_code_${companyName}`,
        widgetCompany
      );
    }
  }, [widgetCompany, companyName]);

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
        data-get-url={`https://us.trendlyne.com/us/web-widget/qvt-widget/Poppins/${widgetCompany}/?posCol=00A25B&primaryCol=006AFF&negCol=EB3B00&neuCol=F7941E`}
        data-theme="light"
      />
    </div>
  );
}
