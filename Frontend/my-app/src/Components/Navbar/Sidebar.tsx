import { Home, People, TrendingUp, Work } from "@mui/icons-material";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onEquityClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, onEquityClick }) => {
  const handleTabClick = (tabName: string) => {
    if (tabName === "Equity") {
      onEquityClick();
    }
    onClose(); // Close drawer after clicking an item (useful in mobile views)
  };

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box', backgroundColor: '#1e1e1e', color: 'white' }
      }}
    >
      <Typography variant="h6" sx={{ p: 2, fontWeight: "bold" }}>Dashboard</Typography>
      <List>
        {[
          { name: "Equity", icon: <Home /> },
          { name: "Converts", icon: <People /> },
          { name: "High Yields", icon: <TrendingUp /> },
          { name: "Macro", icon: <Work /> }
        ].map((tab) => (
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
