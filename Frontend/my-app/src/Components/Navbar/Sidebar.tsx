import { Home, People, TrendingUp, Work } from "@mui/icons-material";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange"; 
import LeaderboardIcon from "@mui/icons-material/Leaderboard"; 
import ShowChartIcon from "@mui/icons-material/ShowChart"; 





interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onTabSelect: (tabName: string) => void;  // Update to notify parent on tab selection
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, onTabSelect }) => {
  const handleTabClick = (tabName: string) => {
    onTabSelect(tabName);  // Notify parent on tab selection
    onClose(); // Close drawer after clicking an item
  };

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box', backgroundColor: '#002060', color: 'white' }
      }}
    >
      <Typography variant="h6" sx={{ p: 2, fontWeight: "bold" }}>Dashboard</Typography>
      <List>
        {[{ name: "Equity", icon: <ShowChartIcon /> },
          { name: "Converts", icon: <CurrencyExchangeIcon /> },
          { name: "High Yields", icon: <TrendingUp /> },
          { name: "Macro", icon: <LeaderboardIcon /> }]
          .map((tab) => (
            <ListItem key={tab.name} disablePadding>
              <ListItemButton onClick={() => handleTabClick(tab.name)}>
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

