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
        // 1. Ask backend for Mattermost login credentials
        const res = await fetch(`${apiUrl}/api/mm_discussion_box/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        const creds = await res.json();
        if (!creds.mm_login_id || !creds.mm_password) {
          console.error("❌ Backend did not return MM credentials");
          return;
        }

        // 2. Tell backend to login to Mattermost (avoids browser CORS)
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

        if (!proxyRes.ok) {
          console.error("❌ Mattermost proxy login failed");
          return;
        }

        const data = await proxyRes.json();

        // 3. Set Mattermost cookies manually
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
                
        // ⭐ NEW — Auto skip the popup
        document.cookie = `MMVIEW_PREFERENCE=browser; Path=/; Max-Age=31536000;`;
        // 4. Give cookies time to settle
        setTimeout(() => setReady(true), 800);

      } catch (err) {
        console.error("❌ Mattermost login error:", err);
      }
    };

    loginToMattermost();
  }, []);

  if (!ready) return <div>Loading chat...</div>;

  return (
    <iframe
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
