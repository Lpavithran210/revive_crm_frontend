import { Alert, Box, Button, Grow, InputAdornment, Snackbar, TextField, Typography } from "@mui/material"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import MailIcon from '@mui/icons-material/Mail';
import { apiCall } from "../utils/axios";

const ForgotPassword = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [snackbar, setSnackbar] = useState({})

    const handleSubmit = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        setSnackbar({open: false, type: '', message: ''});

        if (!email) {
            return setSnackbar({ open: true, type: 'error', message: 'Please enter email' })
        }
        if (!emailRegex.test(email)) {
            return setSnackbar({ open: true, type: 'error', message: 'Invalid email format' })
        }
        try {
            await apiCall('post', "/user/forgotpassword", { email })
            navigate('/verify_otp', { state: email })
        }
        catch (e) {
            if(e.response.status === 429){
                return setSnackbar({open: true, type: 'error', message: e.response.data});
            }
            setSnackbar({ open: true, type: 'error', message: e.response.data.message })
        }
    }
    return (
        <>
            <Box sx={{ height: '100%', display: "flex", alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center', maxWidth: '500px', padding: '20px' }}>
                    <Typography variant="h4" sx={{ mb: 4 }} fontWeight={600}>Forgot Your Password</Typography>
                    <Typography variant="body2">Please enter the email you use to sign in</Typography>
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
                    <Button variant="contained" sx={{ backgroundColor: '#122620', margin: '20px 0', textTransform: 'capitalize' }} onClick={handleSubmit}>Submit</Button>
                    <Typography variant="body2"><Link to='/signin'>Back to sign in</Link></Typography>
                </Box>
            </Box>
            <Snackbar
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                open={snackbar.open}
                autoHideDuration={2000}
                TransitionComponent={Grow}
                onClose={() => setSnackbar({ open: false, type: '', message: '' })}
            >
                <Alert onClose={() => setSnackbar({ open: false, type: '', message: '' })} severity={snackbar.type} sx={{ maxWidth: '500px', textAlign: 'left' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    )
}

export default ForgotPassword