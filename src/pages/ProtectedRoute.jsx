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
import { socket } from "../utils/socket";
import Badge from '@mui/material/Badge';
import { dateFormat } from "../components/StudentForm";

const ProtectedRoute = ({ allowedRoles }) => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const notifRef = useRef(null);

  const [anchorEl, setAnchorEl] = useState(null);

  // 🔥 Notifications (persisted)
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : [];
  });

  // 🔥 Unread count (persisted)
  const [unreadCount, setUnreadCount] = useState(() => {
    const saved = localStorage.getItem("unreadCount");
    return saved ? JSON.parse(saved) : 0;
  });

  const [notifOpen, setNotifOpen] = useState(false);

  const { isLoggedIn, role, name } = useSelector((state) => state.user);

  if (!isLoggedIn) return <Navigate to='/signin' />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />;

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    dispatch(logout());
    navigate("/signin");
  };

  // 🔥 SOCKET LISTENER
  useEffect(() => {
    const handleReminder = (data) => {

      setNotifications(prev => {
        const updated = [data, ...prev].slice(0, 15);
        localStorage.setItem("notifications", JSON.stringify(updated));
        return updated;
      });

      setUnreadCount(prev => {
        const count = prev + 1;
        localStorage.setItem("unreadCount", count);
        return count;
      });

    };

    socket.on("followupReminder", handleReminder);

    return () => {
      socket.off("followupReminder", handleReminder);
    };
  }, []);

  // 🔥 CLOSE ON OUTSIDE CLICK
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

          <Badge
            badgeContent={unreadCount}
            color="error"
            sx={{ marginRight: 3, cursor: "pointer" }}
          >
            <NotificationsOutlinedIcon
              onClick={() => {
                setNotifOpen(prev => !prev);
                setUnreadCount(0);
                localStorage.setItem("unreadCount", 0);
              }}
            />
          </Badge>

          <Avatar
            sx={{ backgroundColor: 'red', cursor: 'pointer' }}
            onClick={handleClick}
          >
            {name.charAt(0)}
          </Avatar>

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

          {notifOpen && (
            <Paper
              ref={notifRef}
              elevation={4}
              sx={{
                position: "absolute",
                top: 40,
                right: 80,
                width: 300,
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
                    <Typography variant="body2" sx={{ pt:1 }}>
                      {n.note}
                    </Typography>
                    <Typography variant="caption" sx={{ pt:1, display: 'block', textAlign: 'right' }}>
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

      {/* BACKDROP FOR MENU */}
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

      {/* MAIN CONTENT */}
      <Box sx={{ backgroundColor: 'white', height: '100%', overflow: 'auto' }}>
        <Outlet />
      </Box>
    </>
  );
};

export default ProtectedRoute;