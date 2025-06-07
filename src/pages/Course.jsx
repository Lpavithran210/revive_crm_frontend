import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, Divider, Grid, IconButton, Paper, Snackbar, Table, TableBody, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material"
import { apiCall } from "../utils/axios";
import { useEffect, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { StyledTableCell, StyledTableRow } from "./Users";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourses } from "../features/courses";

const Course = () => {
    const initialFormState = { title: '', fee: '' };
    const [course, setCourse] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState({ open: false, message: '', type: '' });
    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const dispatch = useDispatch();
    const { accessToken } = useSelector((state) => state.user);
    const allCourses = useSelector((state) => state.courses.allCourses);

    useEffect(() => {
        dispatch(fetchCourses());
    }, [dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourse(prevState => ({ ...prevState, [name]: value }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!course.title?.trim()) newErrors.title = "Title is required";
        if (!course.fee?.trim()) newErrors.fee = "Fee is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = () => {
        if (validateForm()) {
            addCourse();
        }
    };

    const addCourse = async () => {
        try {
            const res = await apiCall('post', '/course/add_course', course, null, accessToken);
            setCourse(initialFormState);
            setErrors({});
            setSnackbarOpen({ open: true, type: 'success', message: res.message });
            dispatch(fetchCourses());
        } catch (e) {
            console.log(e);
            setSnackbarOpen({ open: true, type: 'error', message: e.response?.data?.message || 'Error adding course' });
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await apiCall('delete', `/course/${id}`, null, null, accessToken);
            setOpen(false);
            setSnackbarOpen({ open: true, type: 'success', message: res.message });
            dispatch(fetchCourses());
        } catch (e) {
            console.log(e);
            setSnackbarOpen({ open: true, type: 'error', message: e.response?.data?.message || 'Error deleting course' });
        }
    };


    return <>
        <Box sx={{ padding: 2 }}>
            <Typography variant="h6" sx={{ my: 2 }}>All Courses</Typography>
            <TableContainer component={Paper} sx={{ maxWidth: 700 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>S.no</StyledTableCell>
                            <StyledTableCell align="center">Title</StyledTableCell>
                            <StyledTableCell align="center">Fee</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {allCourses.map((row, ind) => (
                            <StyledTableRow key={row._id}>
                                <StyledTableCell>{ind + 1}</StyledTableCell>
                                <StyledTableCell align="center">{row.title}</StyledTableCell>
                                <StyledTableCell align="center">{row.fee}</StyledTableCell>
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
                        <Typography variant='body2'>Title</Typography>
                        <TextField fullWidth size="small" variant="outlined" name="title" value={course.title || ''} onChange={handleInputChange} error={!!errors.title} helperText={errors.title} />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box>
                        <Typography variant='body2'>Fee</Typography>
                        <TextField fullWidth size="small" variant="outlined" name="fee" value={course.fee || ''} onChange={handleInputChange} error={!!errors.fee} helperText={errors.fee} />
                    </Box>
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

export default Course