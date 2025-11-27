import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const apiUrl = process.env.REACT_APP_API_URL;
const accessToken = localStorage.getItem("access_token");

const MattermostChat: React.FC = () => {
  const { stock } = useParams();               // /chat/:stock  
  const [mmToken, setMmToken] = useState<string>("");

  const fetchMMToken = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/mm_discussion_box/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
        body: JSON.stringify({}), // or remove if backend doesn't need body
      });

      const data = await response.json();
      setMmToken(data.mm_token);

    } catch (error) {
      console.error("Error fetching Mattermost token:", error);
    }
  };

  useEffect(() => {
    fetchMMToken();
  }, []);

  if (!mmToken) {
    return <div style={{ padding: "20px" }}>Loading chat...</div>;
  }

  // Final Mattermost embed URL
  const chatUrl = `http://192.168.1.65:8065/nook/channels/nooks-party?access_token=${mmToken}`;

  return (
    <iframe
      src={chatUrl}
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
