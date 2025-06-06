import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Box, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom';
const ErrorPage = () => {
    const navigate = useNavigate();
    return <>
        <DotLottieReact
            src="/404.lottie"
            loop
            autoplay
        />
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant='contained' sx={{ position: "absolute", textTransform: 'capitalize', bottom: '20px', backgroundColor: '#122620' }} onClick={() => navigate(-1)}>Go Back</Button>
        </Box>
    </>
}

export default ErrorPage