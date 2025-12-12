import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import env from "../../env";

type Status = "idle" | "loading" | "ready" | "error";

const MATTERMOST_ORIGIN = env.mattermostOrigin;
const MATTERMOST_TEAM = env.mattermostTeam;
const DEFAULT_CHANNEL = env.defaultChannel;

const MattermostChat: React.FC = () => {
  const { stock } = useParams();
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);


    const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const accessToken =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const getCookieOptions = () => {
    if (typeof window === "undefined") return "; Path=/";

    const hostname = window.location.hostname;
    const isLocal =
      hostname === "localhost" || hostname === "127.0.0.1";

    if (isLocal) {
      return "; Path=/";
    }

    const domain = env.cookieDomain || ".goldenhillsindia.com";
    return `; Path=/; Domain=${domain}; SameSite=None; Secure`;
  };

  /**
   * AUTO RELOAD after MM boots fully
   */
  useEffect(() => {
    if (status !== "ready") return;

    const reloadTimer = setTimeout(() => {
      const iframe = iframeRef.current;
      if (iframe) iframe.src = iframe.src; // silent reload
    }, 900); // increased from 600 → more stable

    return () => clearTimeout(reloadTimer);
  }, [status]);

  /**
   * MAIN LOGIN FLOW
   */
  useEffect(() => {
    let cookiePoll: number | undefined;
    const abortController = new AbortController();

    const login = async () => {
      try {
        setStatus("loading");

        /** 1) Fetch MM USER credentials from backend */
        const credsRes = await fetch(`${apiUrl}/api/mm_discussion_box/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          signal: abortController.signal,
        });

        if (!credsRes.ok) throw new Error("Could not load session");

        const creds = await credsRes.json();

        /** 2) Login via proxy */
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

        if (!loginRes.ok) throw new Error("Login proxy failed");

        const data = await loginRes.json();
        const { MMAUTHTOKEN, MMUSERID, MMCSRF } = data.cookies || {};

        if (!MMAUTHTOKEN || !MMUSERID) {
          throw new Error("Missing auth cookies");
        }

        /** 3) Apply cookies */
        const opts = getCookieOptions();

        // 🚀 FIX #1 — set view preference FIRST
        document.cookie = `MMVIEW_PREFERENCE=browser${opts}; Max-Age=31536000`;

        // now set the session cookies
        document.cookie = `MMAUTHTOKEN=${MMAUTHTOKEN}${opts}`;
        document.cookie = `MMUSERID=${MMUSERID}${opts}`;
        if (MMCSRF) document.cookie = `MMCSRF=${MMCSRF}${opts}`;

        /** 4) Wait for cookies to actually register */
        const start = Date.now();
        cookiePoll = window.setInterval(() => {
          const allSet =
            document.cookie.includes("MMAUTHTOKEN=") &&
            document.cookie.includes("MMUSERID=") &&
            document.cookie.includes("MMVIEW_PREFERENCE=browser");

          if (allSet) {
            clearInterval(cookiePoll);

            // 🚀 FIX #2 — small delay before ready state
            setTimeout(() => {
              setStatus("ready");

              // reload after iframe mounts
              setTimeout(() => {
                const iframe = iframeRef.current;
                if (iframe) iframe.src = iframe.src;
              }, 900); // increased to avoid race
            }, 500); // slight delay fixes auto-login
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
  }, [accessToken, stock, apiUrl]);

  /**
   * UI STATES
   */
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
        <strong>Chat Loading…</strong>
        <div style={{ marginTop: 6, opacity: 0.8 }}>{error}</div>
      </div>
    );
  }

  /**
   * SUCCESS — Render iframe
   */
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
