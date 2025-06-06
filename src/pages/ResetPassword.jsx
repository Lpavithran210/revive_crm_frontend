import { useState } from "react";
import { Alert, Box, Button, Grow, IconButton, InputAdornment, Snackbar, TextField, Typography } from "@mui/material"
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import { useLocation, useNavigate } from "react-router-dom";
import { apiCall } from "../utils/axios";

const ResetPassword = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const email = location.state
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [snackbar, setSnackbar] = useState({})
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const handleSubmit = async () => {
        if(!password){
            return setSnackbar({ open: true, type: 'error', message: "Password is required" });
        }
        if(!confirmPassword){
            return setSnackbar({ open: true, type: 'error', message: "Confirm password is required" });
        }
        if (password !== confirmPassword) {
            return setSnackbar({ open: true, type: 'error', message: "Password did not match" });
        }
        if (!passwordRegex.test(password)) {
            return setSnackbar({ open: true, type: 'error', message: 'Password must contain 8 chars and must contain 1 number, 1 special character, 1 uppercase and 1 lowercase letter' })
        }
        else {
            try {
                await apiCall('post', '/user/reset_password', {email, password});
                setSnackbar({ open: true, type: 'success', message: "Password changed successfully" });
                navigate('/')
            } catch (error) {
                setSnackbar({ open: true, type: 'error', message: error.response.data.message });
            }
        }
    }
    return (
        <>
            <Box sx={{ height: '100%', display: "flex", alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
                    <Typography variant="h4" fontWeight={600}>Change Password</Typography>
                    <Typography variant="caption">Enter a new password below to change your password</Typography>
                    <TextField
                        type={showPassword ? 'text' : 'password'}
                        label="New password"
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
                                            onClick={() => setShowPassword((show) => !show)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                        size="small"
                        sx={{ mb: 2, mt: 3 }}
                        fullWidth
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <TextField
                        type={showPassword ? 'text' : 'password'}
                        label="Confirm password"
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
                                            onClick={() => setShowPassword((show) => !show)}
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
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button variant="contained" sx={{ backgroundColor: '#122620', margin: '20px 0', textTransform: 'capitalize' }} onClick={handleSubmit}>Change password</Button>
                </Box>
            </Box>
            <Snackbar
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                open={snackbar.open}
                autoHideDuration={2000}
                TransitionComponent={Grow}
                onClose={() => setSnackbar({ open: false, type: '' })}
            >
                <Alert onClose={() => setSnackbar({ open: false, type: '' })} severity={snackbar.type} sx={{ maxWidth: '500px', textAlign: 'left' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    )
}

export default ResetPassword