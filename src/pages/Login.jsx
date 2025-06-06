import { Fragment, useEffect, useId, useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { login } from "../features/user";
import { apiCall } from "../utils/axios";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Alert, Box, Button, Grow, IconButton, InputAdornment, Snackbar, TextField, Typography } from "@mui/material";
import KeyIcon from '@mui/icons-material/Key';
import MailIcon from '@mui/icons-material/Mail';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [snackbar, setSnackbar] = useState({})
    const { isLoggedIn } = useSelector((state) => state.user);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleSubmit = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        
        setSnackbar({open: false, type: '', message: ''});

        if (!email || !password) {
            return setSnackbar({open: true, type: 'error', message: 'Please enter all the mandatory fields!'});
        }
        if (!emailRegex.test(email)) {
            return setSnackbar({open: true, type: 'error', message: 'Invalid email format'});
        }
        if (!passwordRegex.test(password)) {
            return setSnackbar({open: true, type: 'error', message: 'Password must contain 8 chars and must contain 1 number, 1 special character, 1 uppercase and 1 lowercase letter'});
        }
        try {
            const resultAction = await apiCall('post', '/user/signin', { email, password })
            if (resultAction?.data?.accessToken) {
                dispatch(login(resultAction.data))
            } else {
                return setSnackbar({open: true, type: 'error', message: 'User not exists!'});
            }
        } catch (e) {
            console.log(e, 'login error')
            if(e.response.status === 429){
                return setSnackbar({open: true, type: 'error', message: e.response.data});
            }
            setSnackbar({open: true, type: 'error', message: e.response.data.message});
        }
    }

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn, navigate]);
    return (
        <Fragment>
            <Box sx={{ height: '100%', display: "flex", alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
                    <Typography variant="h4" sx={{ mb: 3 }} fontWeight={600}>Welcome Back</Typography>
                    <TextField
                        label="Email"
                        size="small"
                        fullWidth
                        sx={{ my: 2 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <MailIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }
                        }}
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <KeyIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                        size="small"
                        sx={{ mb: 1 }}
                        fullWidth
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Typography sx={{ textAlign: 'right', fontSize: '14px' }}><Link to='/forgot_password'>Forgot password?</Link></Typography>
                    <Button variant="contained" sx={{ backgroundColor: '#122620', margin: '20px 0', textTransform: 'capitalize' }} onClick={handleSubmit}>Sign In</Button>
                    <Snackbar
                        anchorOrigin={{vertical: "top", horizontal: "center"}}
                        open={snackbar.open}
                        autoHideDuration={2000}
                        TransitionComponent={Grow}
                        onClose={() => setSnackbar({open: false, type: ''})}
                    >
                        <Alert onClose={() => setSnackbar({open: false, type: ''})} severity={snackbar.type} sx={{ maxWidth: '500px', textAlign: 'left' }}>
                            {snackbar.message}
                        </Alert>
                    </Snackbar>
                </Box>
            </Box>
    </Fragment>
)}

export default Login