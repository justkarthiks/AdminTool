"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Grow,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import EditIcon from "@mui/icons-material/Edit";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [unlinkId, setUnlinkId] = useState(null);

  const [editingId, setEditingId] = useState(null); // NEW — used for edit mode

  const [newClient, setNewClient] = useState({
    ip: "",
    server: "",
    env: "",
  });

  const [error, setError] = useState("");

  const [filterEnv, setFilterEnv] = useState("ALL");
  const [filterServer, setFilterServer] = useState("");
  const [filterConn, setFilterConn] = useState("ALL");

  const pollingRefs = useRef({});

  // -----------------------------------------------------------
  // LOAD CLIENTS
  // -----------------------------------------------------------
  const loadClients = useCallback(async () => {
    const res = await fetch("/api/clients");
    const data = await res.json();
    setClients(data || []);
  }, []);

  // FIXED
  useEffect(() => {
    Promise.resolve().then(loadClients);
  }, [loadClients]);

  // -----------------------------------------------------------
  // POLLING
  // -----------------------------------------------------------
  const startPolling = useCallback((ip) => {
    if (pollingRefs.current[ip]) return;

    const t = setInterval(async () => {
      let online = false;

      try {
        await fetch(`http://${ip}:4000/api/receive`, { method: "POST" });
        online = true;
      } catch (e) {
        online = false;
      }

      setClients((prev) =>
        prev.map((c) => (c.ip === ip ? { ...c, connected: online } : c))
      );
    }, 2000);

    pollingRefs.current[ip] = t;
  }, []);

  const stopPolling = useCallback((ip) => {
    if (pollingRefs.current[ip]) {
      clearInterval(pollingRefs.current[ip]);
      delete pollingRefs.current[ip];
    }
  }, []);

  // AUTO START POLLING FOR CONNECTED CLIENTS  
  // GLOBAL POLLING — checks all clients every 3 seconds
useEffect(() => {
  const interval = setInterval(async () => {
    const res = await fetch("/api/clients");
    const data = await res.json();
    setClients(data);
  }, 2000);

  return () => clearInterval(interval);
}, []);




  // -----------------------------------------------------------
  // FORM UPDATE
  // -----------------------------------------------------------
  const updateNew = (field, value) => {
    setNewClient((prev) => ({ ...prev, [field]: value }));
  };

  // -----------------------------------------------------------
  // VALIDATION
  // -----------------------------------------------------------
  const validate = () => {
    if (!newClient.ip.trim()) return "IP required";
    if (!newClient.server.trim()) return "Server required";
    if (!newClient.env.trim()) return "Environment required";
    return null;
  };

  // -----------------------------------------------------------
  // SAVE / UPDATE CLIENT
  // -----------------------------------------------------------
  const saveClient = async () => {
    const err = validate();
    if (err) return setError(err);

    setError("");

    await fetch("/api/clients/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newClient, id: editingId }),
    });

    setShowPopup(false);
    setNewClient({ ip: "", server: "", env: "" });
    setEditingId(null);

    await loadClients();
  };

  // -----------------------------------------------------------
  // EDIT CLIENT
  // -----------------------------------------------------------
  const editClient = (client) => {
    setEditingId(client.id);
    setNewClient({
      ip: client.ip,
      server: client.server,
      env: client.env,
    });
    setShowPopup(true);
  };

  // -----------------------------------------------------------
  // REMOVE CLIENT
  // -----------------------------------------------------------
  const removeClient = async (id) => {
    const c = clients.find((x) => x.id === id);
    if (c) stopPolling(c.ip);

    await fetch("/api/clients/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    loadClients();
  };

  // -----------------------------------------------------------
  // FILTER
  // -----------------------------------------------------------
  const filtered = clients.filter((c) => {
    if (filterEnv !== "ALL" && c.env !== filterEnv) return false;
    if (filterServer && !c.server.toLowerCase().includes(filterServer.toLowerCase())) return false;
    if (filterConn === "CONNECTED" && !c.connected) return false;
    if (filterConn === "DISCONNECTED" && c.connected) return false;
    return true;
  });

  // -----------------------------------------------------------
  // UI
  // -----------------------------------------------------------
  return (
    <Box sx={{ p: 4, width: "100%", maxWidth: "1800px", mx: "auto" }}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h4">Client Systems</Typography>

        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowPopup(true)}>
          Add Client
        </Button>
      </Stack>

      {/* FILTERS */}
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Select size="small" value={filterEnv} onChange={(e) => setFilterEnv(e.target.value)}>
          <MenuItem value="ALL">All Env</MenuItem>
          <MenuItem value="DEV">DEV</MenuItem>
          <MenuItem value="UAT">UAT</MenuItem>
          <MenuItem value="PROD">PROD</MenuItem>
        </Select>

        <Select size="small" value={filterConn} onChange={(e) => setFilterConn(e.target.value)}>
          <MenuItem value="ALL">All</MenuItem>
          <MenuItem value="CONNECTED">Online</MenuItem>
          <MenuItem value="DISCONNECTED">Offline</MenuItem>
        </Select>

        <TextField
          size="small"
          label="Search"
          value={filterServer}
          onChange={(e) => setFilterServer(e.target.value)}
        />
      </Stack>

      {/* LIST */}
      <Box sx={{ mt: 4 }}>
        {filtered.map((c) => (
          <Grow in key={c.id}>
            <Card sx={{ mb: 2 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h6">{c.server}</Typography>
                  <Typography sx={{ opacity: 0.8 }}>
                    {c.ip} — {c.server}
                  </Typography>

                  <Chip
                    label={`Env: ${c.env}`}
                    color={c.env === "DEV" ? "info" : c.env === "UAT" ? "warning" : "error"}
                    size="small"
                    sx={{ mt: 1 }}
                  />

                  <Stack direction="row" spacing={1} mt={1}>
                    {c.connected ? <CloudDoneIcon color="success" /> : <CloudOffIcon color="error" />}
                    <Typography>{c.connected ? "Online" : "Offline"}</Typography>
                  </Stack>
                </Box>

                <Stack spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => editClient(c)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="outlined"
                    color="secondary"
                    endIcon={<LinkOffIcon />}
                    onClick={() => setUnlinkId(c.id)}
                  >
                    Unlink
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        ))}
      </Box>

      {/* ADD / EDIT POPUP */}
      <Dialog open={showPopup} onClose={() => setShowPopup(false)} TransitionComponent={Fade}>
        <DialogTitle>{editingId ? "Edit Client" : "Add Client"}</DialogTitle>

        <DialogContent dividers sx={{ width: 400 }}>
          <Stack spacing={2}>
            {error && <Typography color="error">{error}</Typography>}

            <TextField label="IP" value={newClient.ip} onChange={(e) => updateNew("ip", e.target.value)} />
            <TextField label="Server" value={newClient.server} onChange={(e) => updateNew("server", e.target.value)} />

            <Select value={newClient.env} onChange={(e) => updateNew("env", e.target.value)} displayEmpty>
              <MenuItem value="">Select Environment</MenuItem>
              <MenuItem value="DEV">DEV</MenuItem>
              <MenuItem value="UAT">UAT</MenuItem>
              <MenuItem value="PROD">PROD</MenuItem>
            </Select>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowPopup(false)}>Cancel</Button>

          <Button variant="contained" onClick={saveClient}>
            {editingId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* UNLINK CONFIRM */}
      <Dialog open={Boolean(unlinkId)} onClose={() => setUnlinkId(null)} TransitionComponent={Fade}>
        <DialogTitle>Unlink Client?</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnlinkId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              removeClient(unlinkId);
              setUnlinkId(null);
            }}
          >
            Unlink
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
