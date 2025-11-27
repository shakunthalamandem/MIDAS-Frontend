import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const apiUrl = process.env.REACT_APP_API_URL;
const accessToken = localStorage.getItem("access_token");

const MattermostChat: React.FC = () => {
  const { stock } = useParams();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loginToMattermost = async () => {
      try {
        // 1️⃣ Get MM login credentials
        const res = await fetch(`${apiUrl}/api/mm_discussion_box/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        const creds = await res.json();
        if (!creds.mm_login_id) return;

        // 2️⃣ Login via backend proxy (no CORS)
        const proxyRes = await fetch(`${apiUrl}/api/mm_login_proxy/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
          body: JSON.stringify({
            login_id: creds.mm_login_id,
            password: creds.mm_password,
          }),
        });

        const data = await proxyRes.json();

        // 3️⃣ Set MM cookies in browser
        if (data.cookies) {
          if (data.cookies.MMAUTHTOKEN) {
            document.cookie = `MMAUTHTOKEN=${data.cookies.MMAUTHTOKEN}; Path=/;`;
          }
          if (data.cookies.MMUSERID) {
            document.cookie = `MMUSERID=${data.cookies.MMUSERID}; Path=/;`;
          }
          if (data.cookies.MMCSRF) {
            document.cookie = `MMCSRF=${data.cookies.MMCSRF}; Path=/;`;
          }
        }

        // 4️⃣ Always choose browser mode → skips popup
        document.cookie = `MMVIEW_PREFERENCE=browser; Path=/; Max-Age=31536000;`;

        // 5️⃣ Wait for cookies to be visible in JS
        const waitInterval = setInterval(() => {
          const c = document.cookie;

          if (
            c.includes("MMAUTHTOKEN=") &&
            c.includes("MMUSERID=") &&
            c.includes("MMVIEW_PREFERENCE=browser")
          ) {
            clearInterval(waitInterval);

            // 6️⃣ Give Mattermost time to initialize cookies internally
            setTimeout(() => {
              setReady(true);

              // 7️⃣ AUTO-REFRESH the iframe once (important!)
              setTimeout(() => {
                const iframe: any = document.getElementById("mm_iframe");
                if (iframe) iframe.src = iframe.src;
              }, 500);
            }, 300);
          }
        }, 200);
      } catch (err) {
        console.error("Mattermost login error:", err);
      }
    };

    loginToMattermost();
  }, []);

  if (!ready) return <div>Loading chat...</div>;

  return (
    <iframe
      id="mm_iframe"
      src="http://192.168.1.65:8065/nook/channels/nooks-party"
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
