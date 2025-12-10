const env = {
  apiUrl: process.env.REACT_APP_API_URL as string,
  mattermostOrigin: process.env.REACT_APP_MATTERMOST_ORIGIN as string,
  mattermostTeam: process.env.REACT_APP_MATTERMOST_TEAM as string,
  defaultChannel: process.env.REACT_APP_DEFAULT_CHANNEL as string,
  // optional: if not set, code falls back to ".goldenhillsindia.com" in prod
  cookieDomain: process.env.REACT_APP_COOKIE_DOMAIN,
};

export default env;
