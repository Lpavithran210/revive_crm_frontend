import {
  Avatar, Box, Divider, ListItemIcon, ListItemText,
  Menu, MenuItem, Paper, Typography
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useNavigate } from "react-router-dom";

import LogoutIcon from '@mui/icons-material/Logout';
import PostAddIcon from '@mui/icons-material/PostAdd';
import HomeIcon from '@mui/icons-material/Home';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import UploadIcon from '@mui/icons-material/Upload';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';

import { logout } from "../features/user";
import logo from '../assets/revive.jpeg';
import Badge from '@mui/material/Badge';
import { dateFormat } from "../components/StudentForm";

import { socket } from "../utils/socket";

const ProtectedRoute = ({ allowedRoles }) => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const notifRef = useRef(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { isLoggedIn, role, name, _id } = useSelector((state) => state.user);

  // 🔐 Auth checks
  if (!isLoggedIn) return <Navigate to='/signin' />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />;

  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    socket.disconnect();
    dispatch(logout());
    navigate("/signin");
  };

  // ✅ Load notifications from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(`notifications_${_id}`)) || [];
    const storedUnread = Number(localStorage.getItem(`unreadCount_${_id}`)) || 0;

    setNotifications(stored);
    setUnreadCount(storedUnread);
  }, []);

useEffect(() => {
  if (!_id) return;

  // ✅ connect socket if not connected
  if (!socket.connected) {
    socket.connect();
  }

  socket.off("connect");
  socket.off("bulkNotifications");
  socket.off("followupReminder");

  // ✅ register user AFTER connection
  const handleConnect = () => {
    console.log("Connected:", socket.id);
    console.log("Registering user:", _id);

    socket.emit("registerUser", _id);
  };

  socket.on("connect", handleConnect);

  if (socket.connected) {
    console.log("Already connected, registering:", _id);
    socket.emit("registerUser", _id);
  }

  // ✅ BULK (missed notifications after login/refresh)
  socket.on("bulkNotifications", (data) => {
    console.log("BULK RECEIVED:", data);

    setNotifications((prev) => {
      const merged = [...data, ...prev];

      const unique = merged.filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (n) =>
              n.phone === item.phone &&
              n.followupTime === item.followupTime
          )
      );

      const limited = unique.slice(0, 15);

      localStorage.setItem(`notifications_${_id}`,JSON.stringify(limited));

      return limited;
    });

    // ✅ update unread count
      setUnreadCount((prev) => {
      const newCount = prev + data.length;

      localStorage.setItem(`unreadCount_${_id}`, newCount);

      return newCount;
    });
  });

  // ✅ REAL-TIME notification
  socket.on("followupReminder", (data) => {
    console.log("REALTIME RECEIVED:", data);

    setNotifications((prev) => {
      const exists = prev.some(
        (n) =>
          n.phone === data.phone &&
          n.followupTime === data.followupTime
      );

      if (exists) return prev;

      const updated = [data, ...prev].slice(0, 15);

      localStorage.setItem(`notifications_${_id}`,JSON.stringify(updated));

      return updated;
    });

    setUnreadCount((prev) => {
      const newCount = prev + 1;
      localStorage.setItem(`unreadCount_${_id}`,newCount);
      return newCount;
    });
  });

  // ✅ cleanup (VERY IMPORTANT)
  return () => {
    socket.off("connect");
    socket.off("bulkNotifications");
    socket.off("followupReminder");
  };
}, [_id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };

    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifOpen]);

  return (
    <>
      {/* 🔝 HEADER */}
      <Paper sx={{
        display: "flex",
        position: 'sticky',
        top: 0,
        padding: '10px 20px',
        borderRadius: 0,
        backgroundColor: 'white',
        zIndex: 2,
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <img src={logo} width={95} />

        <Box sx={{ display: 'flex', alignItems: 'center', position: "relative" }}>

          {/* 🔔 Notification Icon */}
          <Badge
            badgeContent={unreadCount}
            color="error"
            sx={{ marginRight: 3, cursor: "pointer" }}
            onClick={() => {
              setNotifOpen(!notifOpen);
              setUnreadCount(0);
              localStorage.setItem(`unreadCount_${_id}`, 0);
            }}
          >
            <NotificationsOutlinedIcon />
          </Badge>

          {/* 👤 Avatar */}
          <Avatar
            sx={{ backgroundColor: 'red', cursor: 'pointer' }}
            onClick={handleClick}
          >
            {name?.charAt(0)}
          </Avatar>

          {/* 👇 User Menu */}
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            {role === 'admin' && [
              <MenuItem key="home" onClick={() => { handleClose(); navigate('/'); }}>
                <ListItemIcon><HomeIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Home</ListItemText>
              </MenuItem>,

              <MenuItem key="enquiry" onClick={() => { handleClose(); navigate('/enquiry'); }}>
                <ListItemIcon><PostAddIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Add enquiries</ListItemText>
              </MenuItem>,

              <MenuItem key="team" onClick={() => { handleClose(); navigate('/team'); }}>
                <ListItemIcon><PersonAddAlt1Icon fontSize="small" /></ListItemIcon>
                <ListItemText>Add users</ListItemText>
              </MenuItem>,

              <MenuItem key="course" onClick={() => { handleClose(); navigate('/course'); }}>
                <ListItemIcon><UploadIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Add course</ListItemText>
              </MenuItem>,

              <Divider key="divider" />
            ]}

            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>

          {/* 🔔 Notification Panel */}
          {notifOpen && (
            <Paper
              ref={notifRef}
              elevation={4}
              sx={{
                position: "absolute",
                top: 40,
                right: 80,
                width: 320,
                maxHeight: 400,
                overflowY: "auto",
                zIndex: 5
              }}
            >
              {notifications.length === 0 ? (
                <Typography sx={{ p: 2 }}>
                  No notifications
                </Typography>
              ) : (
                notifications.map((n, i) => (
                  <Box key={i} sx={{ px: 2, pt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {n.name}
                        </Typography>
                        <Typography variant="caption">{n.course}</Typography>
                      </Box>
                      <Typography variant="body2">{n.phone}</Typography>
                    </Box>

                    <Typography variant="body2" sx={{ pt: 1 }}>
                      {n.note}
                    </Typography>

                    <Typography variant="body2" sx={{ pt: 1 }}>
                      {n.attender}
                    </Typography>

                    <Typography variant="caption" sx={{ pt: 1, display: 'block', textAlign: 'right' }}>
                      {dateFormat(n.followupTime)}
                    </Typography>

                    <Divider sx={{ mt: 1 }} />
                  </Box>
                ))
              )}
            </Paper>
          )}
        </Box>
      </Paper>

      {/* BACKDROP */}
      {open && (
        <Box
          onClick={handleClose}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 1
          }}
        />
      )}

      {/* MAIN */}
      <Box sx={{ backgroundColor: 'white', height: '100%', overflow: 'auto' }}>
        <Outlet />
      </Box>
    </>
  );
};

export default ProtectedRoute;