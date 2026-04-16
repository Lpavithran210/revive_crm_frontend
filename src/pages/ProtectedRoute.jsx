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
import apiClient from "../utils/axios";
import dayjs from "dayjs";

const ProtectedRoute = ({ allowedRoles }) => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const notifRef = useRef(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { isLoggedIn, role, name, _id } = useSelector((state) => state.user);

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

  // 🔹 Load notifications from DB
  const fetchNotifications = async () => {
    try {

      const { data } = await apiClient.get("/api/notifications");

      setNotifications(data);

      const unread = data.filter(n => !n.read).length;

      setUnreadCount(unread);

    } catch (err) {
      console.error("Notification fetch error", err);
    }
  };

  useEffect(() => {

    if (_id) fetchNotifications();

  }, [_id]);

  // 🔹 Socket connection
  useEffect(() => {

    if (!_id) return;

    if (!socket.connected) socket.connect();

    socket.off("connect");
    socket.off("followupReminder");

    socket.on("connect", () => {

      console.log("Connected:", socket.id);

      socket.emit("registerUser", _id);

    });

    socket.on("followupReminder", (notification) => {

      console.log("Realtime notification:", notification);

      setNotifications(prev => [notification, ...prev]);

      setUnreadCount(prev => prev + 1);

    });

    return () => {

      socket.off("connect");
      socket.off("followupReminder");

    };

  }, [_id]);

  // 🔹 mark notifications read
  const openNotifications = async () => {

    setNotifOpen(!notifOpen);

    if (!notifOpen) {
      setUnreadCount(0);
      try {
        await apiClient.patch("/api/notifications/read");
      } catch (err) {
        console.error("Read update failed");
      }
    }
  };

  // click outside
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
      {/* HEADER */}
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

          {/* 🔔 Notifications */}
          <Badge
            badgeContent={unreadCount}
            color="error"
            sx={{ marginRight: 3, cursor: "pointer" }}
            onClick={openNotifications}
          >
            <NotificationsOutlinedIcon />
          </Badge>

          {/* Avatar */}
          <Avatar
            sx={{ backgroundColor: 'red', cursor: 'pointer' }}
            onClick={handleClick}
          >
            {name?.charAt(0)}
          </Avatar>

          {/* User menu */}
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

          {/* Notification panel */}
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

                notifications.map((n) => (

                  <Box key={n._id} sx={{ px: 2, pt: 2 }}>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>

                      <Box>

                        <Typography variant="subtitle2" fontWeight={600}>
                          {n.data?.name}
                        </Typography>

                        <Typography variant="caption">
                          {n.data?.course}
                        </Typography>

                      </Box>

                      <Typography variant="body2">
                        {n.data?.phone}
                      </Typography>

                    </Box>

                    <Typography variant="body2" sx={{ pt: 1 }}>
                      {n.data?.note}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{ pt: 1, display: 'block', textAlign: 'right' }}
                    >
                      Next Followup: {dateFormat(n.data?.followupTime)}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{ pt: 1, display: 'block', textAlign: 'right' }}
                    >
                      Previous Followup: {dateFormat(n.data?.lastFollowupDate)}
                    </Typography>

                    <Divider sx={{ mt: 1 }} />

                  </Box>

                ))

              )}

            </Paper>
          )}

        </Box>

      </Paper>

      <Box sx={{ backgroundColor: 'white', height: '100%', overflow: 'auto' }}>
        <Outlet />
      </Box>
    </>
  );
};

export default ProtectedRoute;