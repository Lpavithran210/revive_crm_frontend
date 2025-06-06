import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { apiCall } from "../utils/axios"
import { Alert, Box, Button, Grow, Snackbar, TextField, Typography } from "@mui/material"

const VerifyOTP = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const email = location.state
    const [otp, setOtp] = useState('')
    const [snackbar, setSnackbar] = useState({})

    const handleSubmit = async () => {

        setSnackbar({open: false, type: '', message: ''});
        
        if (otp.length === 4) {
            try {
                await apiCall("post", "/user/verify_otp", { email, otp })
                navigate('/reset_password', {state: email})
            } catch (e) {
                console.log(e, 'msg')
                if(e.response.status === 429){
                    return setSnackbar({open: true, type: 'error', message: e.response.data});
                }
                setSnackbar({ open: true, type: 'error', message: e.response.data.message })
            }
        } else {
            setSnackbar({ open: true, type: 'error', message: 'Enter 4 digit code' })
        }
    }
    return (
        <>
            <Box sx={{ height: '100%', display: "flex", alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
                    <Typography variant="h4" sx={{ mb: 3 }} fontWeight={600}>OTP Verification</Typography>
                    <Typography variant="body2" sx={{ mt: 2 }}>One Time Password (OTP) has been sent via Email to</Typography>
                    <Typography variant="body2" fontWeight={600}>{email}</Typography>
                    <Typography variant="body2" sx={{ mt: 3 }}>Enter the OTP below to verify it.</Typography>
                    <TextField size="small" label="OTP" sx={{ my: 2 }} value={otp} onChange={(e) => setOtp(e.target.value)} /><br />
                    <Button variant="contained" sx={{ backgroundColor: '#122620', my: 2, textTransform: 'capitalize' }} onClick={handleSubmit}>Verify OTP</Button>
                    <Typography variant="body2"><Link to='/forgot_password'>Go back</Link></Typography>
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

export default VerifyOTP