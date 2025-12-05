import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

type Status = "idle" | "loading" | "ready" | "error";

const MATTERMOST_ORIGIN = process.env.REACT_APP_MATTERMOST_ORIGIN as string;
const MATTERMOST_TEAM = process.env.REACT_APP_MATTERMOST_TEAM as string;
const DEFAULT_CHANNEL = process.env.REACT_APP_DEFAULT_CHANNEL as string;

const apiUrl = process.env.REACT_APP_API_URL as string;

const MattermostChat: React.FC = () => {
  const { stock } = useParams();

  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const accessToken =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  /** ----------------------------------------------------
   * AUTO-REFRESH iframe once after MM finishes booting
   * ---------------------------------------------------*/
  useEffect(() => {
    if (status !== "ready") return;

    const t = setTimeout(() => {
      const iframe = iframeRef.current;
      if (iframe) iframe.src = iframe.src + ""; // silent reload
    }, 500);

    return () => clearTimeout(t);
  }, [status]);

  /** ----------------------------------------------------
   * MAIN LOGIN FLOW
   * ---------------------------------------------------*/
  useEffect(() => {
    let cookiePoll: number | undefined;
    let abortController = new AbortController();

    const login = async () => {
      try {
        setStatus("loading");

        /** ------- 1) Get MM credentials from backend ------- */
        const credsRes = await fetch(`${apiUrl}/api/mm_discussion_box/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          signal: abortController.signal,
        });

        if (!credsRes.ok) throw new Error("Could not load session");

        const creds = await credsRes.json();

        /** ------- 2) Login proxy ------- */
        const loginRes = await fetch(`${apiUrl}/api/mm_login_proxy/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            login_id: creds.mm_login_id,
            password: creds.mm_password,
          }),
          signal: abortController.signal,
        });

        const data = await loginRes.json();
        const { MMAUTHTOKEN, MMUSERID, MMCSRF } = data.cookies || {};

        /** ------- 3) Set session cookies ------- */
        const opts = "; Path=/; SameSite=Lax";
        document.cookie = `MMAUTHTOKEN=${MMAUTHTOKEN}${opts}`;
        document.cookie = `MMUSERID=${MMUSERID}${opts}`;
        if (MMCSRF) document.cookie = `MMCSRF=${MMCSRF}${opts}`;

        // Always force browser mode → prevents "View in Browser"
        document.cookie =
          "MMVIEW_PREFERENCE=browser; Path=/; Max-Age=31536000; SameSite=Lax";

        /** ------- 4) Wait until cookies actually appear ------- */
        const start = Date.now();
        cookiePoll = window.setInterval(() => {
          const allSet =
            document.cookie.includes("MMAUTHTOKEN=") &&
            document.cookie.includes("MMUSERID=") &&
            document.cookie.includes("MMVIEW_PREFERENCE=browser");

          if (allSet) {
            clearInterval(cookiePoll);
            setTimeout(() => setStatus("ready"), 300);
          } else if (Date.now() - start > 10000) {
            clearInterval(cookiePoll);
            throw new Error("Timeout: cookies not applied");
          }
        }, 150);
      } catch (err: any) {
        setError(err?.message || "Unable to load chat");
        setStatus("error");
      }
    };

    login();

    return () => {
      abortController.abort();
      if (cookiePoll) clearInterval(cookiePoll);
    };
  }, [accessToken, stock]);

  /** ----------------------------------------------------
   * UI STATES
   * ---------------------------------------------------*/

  if (status === "loading") {
    return (
      <div
        style={{
          width: "100%",
          height: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050716",
          color: "white",
        }}
      >
        Connecting to discussion…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        style={{
          width: "100%",
          height: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          background: "white",
          color: "#111",
        }}
      >
        <strong>Chat Loading...</strong>
        <div style={{ marginTop: 6, opacity: 0.8 }}>{error}</div>
      </div>
    );
  }

  /** ----------------------------------------------------
   * SUCCESS — Render Iframe
   * ---------------------------------------------------*/
  const channelSlug =
    stock && typeof stock === "string"
      ? `${stock.toLowerCase()}-thoughts`
      : DEFAULT_CHANNEL;

  const iframeSrc = `${MATTERMOST_ORIGIN}/${MATTERMOST_TEAM}/channels/${channelSlug}`;

  return (
    <iframe
      ref={iframeRef}
      id="mm_iframe"
      key={iframeSrc}
      src={iframeSrc}
      title="Mattermost Chat"
      style={{
        width: "100%",
        height: "90vh",
        border: "none",
        borderRadius: "10px",
      }}
    />
  );
};

export default MattermostChat;
