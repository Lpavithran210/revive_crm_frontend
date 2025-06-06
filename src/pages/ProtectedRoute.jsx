import { Avatar, Box, Divider, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Typography } from "@mui/material"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Navigate, Outlet, useNavigate } from "react-router-dom"
import LogoutIcon from '@mui/icons-material/Logout';
import PostAddIcon from '@mui/icons-material/PostAdd';
import HomeIcon from '@mui/icons-material/Home';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import UploadIcon from '@mui/icons-material/Upload';
import { logout } from "../features/user";
import logo from '../assets/revive.jpeg';

const ProtectedRoute = ({ allowedRoles }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [anchorEl, setAnchorEl] = useState(null);

    const { isLoggedIn, role, name } = useSelector((state) => state.user)
    if (!isLoggedIn) {
        return <Navigate to='/signin' />
    }
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" />
    }

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

    return <>
        <Paper sx={{ display: "flex", position: 'sticky', top: 0, padding: '10px 20px', borderRadius: 0, backgroundColor: 'white', zIndex: 2, alignItems: 'center', justifyContent: 'space-between' }}>
            <img src={logo} width={95}/>
            <Avatar sx={{ backgroundColor: 'red', textTransform: 'capitalize' }} onClick={handleClick}>{name.charAt(0)}</Avatar>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                {role === 'admin' && <>
                    <MenuItem onClick={() => [handleClose(), navigate('/')]}>
                        <ListItemIcon>
                            <HomeIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Home</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => [handleClose(), navigate('/enquiry')]}>
                        <ListItemIcon>
                            <PostAddIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Add enquiries</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => [handleClose(), navigate('/team')]}>
                        <ListItemIcon>
                            <PersonAddAlt1Icon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Add users</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => [handleClose(), navigate('/course')]}>
                        <ListItemIcon>
                            <UploadIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Add course</ListItemText>
                    </MenuItem>
                    <Divider/>
                </>}
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                </MenuItem>
            </Menu>
        </Paper>
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
        <Box sx={{ backgroundColor: 'white', height: '100%', overflow: 'auto', scrollbarWidth: 1 }}>
            <Outlet />
        </Box>
    </>
}

export default ProtectedRoute