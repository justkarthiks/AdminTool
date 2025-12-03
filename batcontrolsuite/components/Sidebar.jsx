"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";

// MUI Components
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

// MUI Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import StorageIcon from "@mui/icons-material/Storage";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import HistoryIcon from "@mui/icons-material/History";
import DevicesIcon from "@mui/icons-material/Devices";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SettingsIcon from "@mui/icons-material/Settings";

const drawerWidth = 240;

/* ------------------------- Reusable Material NavItem ------------------------- */
function NavItem({ label, target, icon }) {
  const router = useRouter();
  const pathname = usePathname();

  const active = pathname.startsWith(target);

  return (
    <ListItemButton
      onClick={() => router.push(target)}
      selected={active}
      sx={{
        borderRadius: 1,
        mx: 1,
        "&.Mui-selected": {
          backgroundColor: "primary.main",
          color: "white",
          "&:hover": {
            backgroundColor: "primary.dark",
          },
        },
      }}
    >
      <ListItemIcon
        sx={{
          color: active ? "white" : "inherit",
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  );
}

/* ------------------------------- Sidebar ---------------------------------- */
export default function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Scriptrunrr
        </Typography>
      </Toolbar>

      <Divider />

      <List>
        <NavItem label="Dashboard" target="/dashboard" icon={<DashboardIcon />} />
        <NavItem label="Script Library" target="/scripts" icon={<StorageIcon />} />
        <NavItem label="Execution" target="/execution" icon={<PlayArrowIcon />} />
        <NavItem label="Execution History" target="/history" icon={<HistoryIcon />} />
      </List>

      <Divider sx={{ my: 1 }} />

      <List>
        <NavItem label="Clients" target="/clients" icon={<DevicesIcon />} />
        <NavItem label="Schedules" target="/schedules" icon={<ScheduleIcon />} />
        <NavItem label="Settings" target="/settings" icon={<SettingsIcon />} />
      </List>
    </Drawer>
  );
}
