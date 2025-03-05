import { TrendingUp, HighlightOff } from "@mui/icons-material";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Box } from "@mui/material";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { useState } from "react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onTabSelect: (tabName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, onTabSelect }) => {
  const [selectedTab, setSelectedTab] = useState<string>("Equity"); // Default to "Equity"

  const handleTabClick = (tabName: string) => {
    setSelectedTab(tabName);
    onTabSelect(tabName);
    onClose();
  };

  const menuItems = [
    { name: "Equity", icon: <ShowChartIcon /> },
    { name: "High Yields", icon: <TrendingUp /> },
    { name: "Converts", icon: <CurrencyExchangeIcon /> },
    { name: "Macro", icon: <LeaderboardIcon /> }
  ];

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#002060',
          color: 'white',
          marginTop: '93px'
        }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 2 ,borderBottom:'1px solid #fff'}}>
        <Typography variant="h6" fontWeight="bold">Dashboard</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <HighlightOff />
        </IconButton>
      </Box>
      <List>
        {menuItems.map((tab) => (
          <ListItem key={tab.name} disablePadding>
            <ListItemButton
              onClick={() => handleTabClick(tab.name)}
              sx={{
                backgroundColor: selectedTab === tab.name ? "#004080" : "transparent",
                "&:hover": {
                  backgroundColor: "#0050A0"
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>{tab.icon}</ListItemIcon>
              <ListItemText primary={tab.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
