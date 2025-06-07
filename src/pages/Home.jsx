import { Box, Card, Grid, Typography } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PieChart } from '@mui/x-charts/PieChart';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import PhoneCallbackIcon from '@mui/icons-material/PhoneCallback';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import PendingIcon from '@mui/icons-material/Pending';
import StudentsTable from '../components/Table';
import { apiCall } from '../utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../features/courses';
import { fetchMembers } from '../features/members';

const Home = () => {

    const dateFieldStyle = {
        width: '200px',
        '& .MuiInputBase-root': {
            height: 36,
            paddingRight: 1,
        },
        '& .MuiInputBase-input': {
            padding: '8px 14px',
            fontSize: '0.875rem',
        },
    };

    const [startDate, setStartDate] = useState(dayjs());
    const [endDate, setEndDate] = useState(dayjs());
    const [data, setData] = useState([])
    const [statusCounts, setStatusCounts] = useState({});
    const [sourceCounts, setSourceCounts] = useState({});
    const [attenderCounts, setAttenderCounts] = useState({});
    const [courseStats, setCourseStats] = useState({});
    const [totalPaid, setTotalPaid] = useState(0);
    const [revenueByAttender, setRevenueByAttender] = useState({});
    const { accessToken } = useSelector((state) => state.user);
    const dispatch = useDispatch()

    const fetchEnquiries = async () => {
        try {
            const startFormatted = startDate.startOf('day').toISOString();
            const endFormatted = endDate.endOf('day').toISOString();
            const response = await apiCall('get', '/enquiries', null, {
                startDate: startFormatted,
                endDate: endFormatted,
            }, accessToken);

            setData(response);

            const totalPaidAmount = response.reduce((total, item) => {
                const paymentTotal = item.payments?.reduce((sum, payment) => sum + (payment.paid_amount || 0), 0) || 0;
                return total + paymentTotal;
            }, 0);
            setTotalPaid(totalPaidAmount);

            const countsByStatus = response.reduce((acc, item) => {
                acc[item.status] = (acc[item.status] || 0) + 1;
                return acc;
            }, {});
            setStatusCounts(countsByStatus);

            const countsBySource = response.reduce((acc, item) => {
                acc[item.source] = (acc[item.source] || 0) + 1;
                return acc;
            }, {});
            setSourceCounts(countsBySource);

            const totalByAttender = response.reduce((acc, item) => {
                const name = item.attender;
                if (name) {
                    acc[name] = (acc[name] || 0) + 1;
                }
                return acc;
            }, {});

            setAttenderCounts(totalByAttender);

            const countsByCourse = response.reduce((acc, item) => {
                const course = item.course?.trim();
                if (course) {
                    acc[course] = (acc[course] || 0) + 1;
                }
                return acc;
            }, {});
            setCourseStats(countsByCourse);

            const revenueByAttender = response.reduce((acc, item) => {
                const name = item.attender;
                const total = item.payments?.reduce((sum, payment) => sum + (payment.paid_amount || 0), 0) || 0;
                if (name) {
                    acc[name] = (acc[name] || 0) + total;
                }
                return acc;
            }, {});
            setRevenueByAttender(revenueByAttender);

        } catch (error) {
            console.error('Error fetching enquiries:', error);
        }
    };

    const cards = [
        { title: 'Pending', count: statusCounts["Pending"] || 0, color: '#53a1fc', icon: <PendingIcon style={{ fontSize: '50px', color: 'white' }} /> },
        { title: 'Follow-ups', count: statusCounts["Follow up"] || 0, color: '#8a95fb', icon: <PhoneCallbackIcon style={{ fontSize: '50px', color: 'white' }} /> },
        { title: 'Loss', count: statusCounts["Loss"] || 0, color: 'red', icon: <NotInterestedIcon style={{ fontSize: '50px', color: 'white' }} /> },
        { title: 'Success', count: statusCounts["Success"] || 0, color: 'green', icon: <CheckCircleIcon style={{ fontSize: '50px', color: 'white' }} /> },
        { title: 'Revenue', count: totalPaid.toLocaleString() || 0, color: 'purple', icon: <CurrencyRupeeIcon style={{ fontSize: '50px', color: 'white' }} /> },
    ]

    const desktopOS = Object.entries(sourceCounts).map(([label, value]) => ({ label, value }));
    const attenderChartData = Object.entries(attenderCounts).map(([label, value]) => ({ label, value }));
    const courseChartData = Object.entries(courseStats).map(([label, value]) => ({ label, value }));
    const attenderRevenueChartData = Object.entries(revenueByAttender).map(([label, value]) => ({ label, value }));

    useEffect(() => {
        fetchEnquiries()
    }, [startDate, endDate])

    useEffect(() => {
        dispatch(fetchCourses())
        dispatch(fetchMembers())
    }, [])

    return <>
        <Box sx={{ padding: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', gap: 3, margin: '10px 0 30px 0' }}>
                <Typography variant="h5">CRM Dashboard</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label='Start date'
                            value={startDate}
                            maxDate={dayjs()}
                            onChange={(newValue) => {
                                setStartDate(newValue);
                                if (endDate.isBefore(newValue)) {
                                    setEndDate(newValue);
                                }
                            }}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    size: "small",
                                    sx: dateFieldStyle,
                                },
                            }}
                        />
                        <DatePicker
                            label='End date'
                            value={endDate}
                            minDate={startDate}
                            maxDate={dayjs()}
                            onChange={(newValue) => setEndDate(newValue)}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    size: "small",
                                    sx: dateFieldStyle,
                                },
                            }}
                        />
                    </LocalizationProvider>
                </Box>
            </Box>
            <Grid container spacing={2} sx={{ marginBottom: '30px' }}>
                {
                    cards.map((card, index) => {
                        return <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                            <Card>
                                <Box sx={{ display: 'flex', padding: "20px", backgroundColor: card.color, alignItems: 'center', justifyContent: 'space-between' }}>
                                    {card.icon}
                                    <Box sx={{ textAlign: 'end' }}>
                                        <Typography variant='h5' sx={{ color: 'white' }}>{card.count}</Typography>
                                        <Typography variant='body1' sx={{ color: 'white' }}>{card.title}</Typography>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    })
                }
            </Grid>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ backgroundColor: 'lightcyan', padding: "20px" }}>
                        <Typography variant='body1'>Lead Source Analysis</Typography>
                        <PieChart
                            series={[
                                {
                                    data: desktopOS,
                                    innerRadius: 50,
                                    cornerRadius: 4,
                                    highlightScope: { fade: 'global', highlight: 'item' },
                                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                    arcLabel: (item) => `${item.value}`
                                },
                            ]}
                            height={200}
                            width={200}
                        />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ backgroundColor: 'lightcyan', padding: "20px" }}>
                        <Typography variant='body1'>Enquired Course Analysis</Typography>
                        <PieChart
                            series={[
                                {
                                    data: courseChartData,
                                    cornerRadius: 4,
                                    highlightScope: { fade: 'global', highlight: 'item' },
                                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                    arcLabel: (item) => `${item.value}`
                                },
                            ]}
                            height={200}
                            width={200}
                        />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ backgroundColor: 'lightcyan', padding: "20px" }}>
                        <Typography variant='body1'>Total Enquired Count</Typography>
                        <PieChart
                            series={[
                                {
                                    data: attenderChartData,
                                    cornerRadius: 4,
                                    highlightScope: { fade: 'global', highlight: 'item' },
                                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                    arcLabel: (item) => `${item.value}`
                                },
                            ]}
                            height={200}
                            width={200}
                        />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ backgroundColor: 'lightcyan', padding: "20px" }}>
                        <Typography variant='body1'>Revenue by Attender</Typography>
                        <PieChart
                            series={[
                                {
                                    data: attenderRevenueChartData,
                                    cornerRadius: 4,
                                    highlightScope: { fade: 'global', highlight: 'item' },
                                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                    arcLabel: (item) => `₹${item.value}`
                                },
                            ]}
                            height={200}
                            width={200}
                        />
                    </Box>
                </Grid>
            </Grid>
            <StudentsTable records={data} refreshRecords={fetchEnquiries} />
        </Box>
    </>
}

export default Home