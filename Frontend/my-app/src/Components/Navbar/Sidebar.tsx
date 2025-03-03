import { useState } from "react";
import { Home, People, TrendingUp, Work } from "@mui/icons-material";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";

interface Tab {
  name: string;
  icon: JSX.Element;
}

const tabs: Tab[] = [
  { name: "Equity", icon: <Home /> },
  { name: "Connects", icon: <People /> },
  { name: "High Yields", icon: <TrendingUp /> },
  { name: "Macro", icon: <Work /> },
];

function Sidebar() {
  const [activeTab, setActiveTab] = useState<string>("Equity");

  return (
    <Drawer variant="permanent" anchor="left" sx={{ width: 240, flexShrink: 0, '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box', backgroundColor: '#1e1e1e', color: 'white' } }}>
      <Typography variant="h6" sx={{ p: 2, fontWeight: "bold" }}>Dashboard</Typography>
      <List>
        {tabs.map((tab) => (
          <ListItem key={tab.name} disablePadding>
            <ListItemButton selected={activeTab === tab.name} onClick={() => setActiveTab(tab.name)}>
              <ListItemIcon sx={{ color: 'white' }}>{tab.icon}</ListItemIcon>
              <ListItemText primary={tab.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;
