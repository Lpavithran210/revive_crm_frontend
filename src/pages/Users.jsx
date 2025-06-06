import { Alert, Box, Button, FormControl, FormHelperText, Grid, MenuItem, Select, Snackbar, Table, TableCell, TableBody, tableCellClasses, TableContainer, TableHead, TableRow, TextField, Typography, styled, IconButton, Divider, Paper, Dialog, DialogContent, DialogContentText, DialogActions } from "@mui/material"
import { useEffect, useState } from "react";
import { apiCall } from "../utils/axios";
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { allMembers } from "../features/members";
import { useDispatch, useSelector } from "react-redux";

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    export const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
        '&:last-child td, &:last-child th': {
            border: 0,
        },
    }));

const Users = () => {
    const initialFormState = { name: '', email: '', password: '', role: '' };
    const [snackbarOpen, setSnackbarOpen] = useState({ open: false, message: '', type: '' });
    const [errors, setErrors] = useState({})
    const [state, setState] = useState(initialFormState)
    const [users, setUsers] = useState([])
    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null)
    const dispatch = useDispatch()
    const { accessToken } = useSelector((state) => state.user);

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setState(prevState => ({ ...prevState, [name]: value }))
    }

    const validateForm = () => {
        const newErrors = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!state.name?.trim()) newErrors.name = "Username is required";
        if (!state.email?.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(state.email)) {
            newErrors.email = "Invalid email format";
        }
        if (!state.password?.trim()) {
            newErrors.password = "Password is required";
        } else if (!passwordRegex.test(state.password)) {
            newErrors.password = "Password must contain 8 chars and must contain 1 number, 1 special character, 1 uppercase and 1 lowercase letter";
        }
        if (!state.role) newErrors.role = "Please select a role";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const addUser = async () => {
        try {
            const res = await apiCall('post', '/user/add_user', { ...state }, null, accessToken)
            setState(initialFormState);
            setErrors({});
            setSnackbarOpen({ open: true, type: 'success', message: res.message });
            getAllUsers()
        } catch (e) {
            console.log(e)
            setSnackbarOpen({ open: true, type: 'error', message: e.response.data.message });
        }
    }

    const getAllUsers = async () => {
        try {
            const users = await apiCall('get', '/user/members', null, null, accessToken)
            setUsers(users.data)
            dispatch(allMembers(users.data))
        } catch (e) {
            console.log(e.message)
        }
    }

    const handleFormSubmit = () => {
        if (validateForm()) {
            addUser();
        }
    }

    const handleDelete = async (id) => {
        try {
            const res = await apiCall('delete', `/user/${id}`, null, null, accessToken)
            setOpen(false)
            setSnackbarOpen({ open: true, type: 'success', message: res.message });
            getAllUsers()
        } catch (e) {
            console.log(e)
            setSnackbarOpen({ open: true, type: 'error', message: e.response.data.message });
        }
    }

    useEffect(() => {
        getAllUsers()
    }, [])
    return <>
        <Box sx={{ padding: 2 }}>
            <Typography variant="h6" sx={{ my: 2 }}>All Users</Typography>
            <TableContainer component={Paper} sx={{ maxWidth: 700 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell align="center">Email</StyledTableCell>
                            <StyledTableCell align="center">Role</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((row) => (
                            <StyledTableRow key={row._id}>
                                <StyledTableCell component="th" scope="row">{row.name}</StyledTableCell>
                                <StyledTableCell align="center">{row.email}</StyledTableCell>
                                <StyledTableCell align="center">{row.role}</StyledTableCell>
                                <StyledTableCell align="center">
                                    <IconButton onClick={() => [setOpen(true), setDeleteId(row._id)]} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Divider sx={{ my: 4 }} />
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box>
                        <Typography variant='body2'>Username</Typography>
                        <TextField fullWidth size="small" variant="outlined" name="name" value={state.name || ''} onChange={handleInputChange} error={!!errors.name} helperText={errors.name} />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box>
                        <Typography variant='body2'>Email</Typography>
                        <TextField fullWidth size="small" variant="outlined" name="email" value={state.email || ''} onChange={handleInputChange} error={!!errors.email} helperText={errors.email} />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box>
                        <Typography variant='body2'>Password</Typography>
                        <TextField fullWidth size="small" variant="outlined" name="password" value={state.password || ''} onChange={handleInputChange} error={!!errors.password} helperText={errors.password} />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small" error={!!errors.role}>
                        <Typography variant='body2'>Role</Typography>
                        <Select fullWidth size="small" name="role" value={state.role || ''} onChange={handleInputChange}>
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="user">User</MenuItem>
                        </Select>
                        {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                    </FormControl>
                </Grid>
            </Grid>
            <Button variant="contained" sx={{ textTransform: 'capitalize', mt: '30px', backgroundColor: '#224436' }} onClick={handleFormSubmit}>Create</Button>
            <Snackbar
                open={snackbarOpen.open}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen({ ...snackbarOpen, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen({ ...snackbarOpen, open: false })} severity={snackbarOpen.type} sx={{ width: '100%' }}>
                    {snackbarOpen.message}
                </Alert>
            </Snackbar>
            <Dialog
                maxWidth="sm"
                sx={{ textAlign: 'center' }}
                open={open}
                onClose={() => setOpen(false)}>
                <Box sx={{ p: 2 }}>
                    <Box sx={{ margin: "auto" }}><ErrorOutlineIcon color="error" fontSize="large" /></Box>
                    <Typography variant="h6" fontWeight={500}>Are you sure?</Typography>
                    <DialogContent>
                        <DialogContentText sx={{ fontSize: '12px' }}>
                            Do you really want to delete this user? This<br />process cannot be undone
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button variant="contained" sx={{ boxShadow: 'none', '&:hover': { boxShadow: 'none' }, backgroundColor: '#c1c1c1', color: 'black', fontSize: '12px', textTransform: 'unset' }} onClick={() => setOpen(false)}>No, cancel</Button>
                        <Button variant="contained" color="error" sx={{ boxShadow: 'none', '&:hover': { boxShadow: 'none' }, fontSize: '12px', textTransform: 'unset' }} onClick={() => handleDelete(deleteId)} autoFocus>Yes, delete it!</Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    </>
}

export default Users