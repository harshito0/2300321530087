import { AppBar, Toolbar, IconButton, Typography, Box, Drawer, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Menu as MenuIcon, Dashboard as DashboardIcon, Notifications as NotificationsIcon, Inbox as InboxIcon } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", to: "/", icon: <DashboardIcon /> },
  { label: "Notifications", to: "/notifications", icon: <NotificationsIcon /> },
  { label: "Priority Inbox", to: "/priority", icon: <InboxIcon /> }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(!open);

  const drawer = (
    <Box onClick={toggle} sx={{ width: 250 }}>
      <List>
        {navItems.map((it) => (
          <ListItem button component={RouterLink} to={it.to} key={it.label}>
            <ListItemIcon>{it.icon}</ListItemIcon>
            <ListItemText primary={it.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggle} sx={{ mr: 2, display: { md: "none" } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}>
            Campus Notifications
          </Typography>
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            {navItems.map((it) => (
              <Typography key={it.label} component={RouterLink} to={it.to} variant="button" color="inherit" sx={{ ml: 2, textDecoration: "none" }}>
                {it.label}
              </Typography>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={open} onClose={toggle} ModalProps={{ keepMounted: true }}>
        {drawer}
      </Drawer>
    </>
  );
}
