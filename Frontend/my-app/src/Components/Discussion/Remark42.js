import { useEffect } from "react";

const Remark42 = ({ pageId }) => {
  useEffect(() => {
    // config
    window.remark_config = {
      host: "http://localhost:8080",
      site_id: "stock_comments",
      components: ["embed"],
      url: window.location.href,
      page_title: document.title,
    };

    // remove previous widget on route changes
    const container = document.getElementById("remark42");
    if (container) container.innerHTML = "";

    // load Remark42 script
    const script = document.createElement("script");
    const noModule = "noModule" in script;

    script.src = `${window.remark_config.host}/web/embed${noModule ? ".mjs" : ".js"}`;
    script.async = true;
    script.defer = true;

    document.body.appendChild(script);

    return () => {
      // cleanup
      if (container) container.innerHTML = "";
    };
  }, [pageId]);

  return <div id="remark42"></div>;
};

export default Remark42;
