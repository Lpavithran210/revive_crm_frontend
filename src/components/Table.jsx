import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Box, Button, Dialog, DialogContent, DialogTitle, InputAdornment, TextField, Typography, Chip } from '@mui/material';
import StudentForm, { dateFormat } from './StudentForm';
import SearchIcon from '@mui/icons-material/Search';
import { apiCall } from '../utils/axios';
import Papa from 'papaparse';
import { useSelector } from 'react-redux';

const dispositionColors = {
    "Not Contacted": { bg: "#9E9E9E", color: "#fff", },
    "RNR": { bg: "#EF5350", color: "#fff", },
    "Call Back": { bg: "#FFA726", color: "#fff", },
    "Interested": { bg: "#4CAF50", color: "#fff", },
    "Not Interested": { bg: "#E53935", color: "#fff", },
    "Not Qualified": { bg: "#8D6E63", color: "#fff", },
    "Demo Scheduled": { bg: "#42A5F5", color: "#fff", },
    "Demo Completed": { bg: "#5E35B1", color: "#fff", },
    "Visit": { bg: "#26A69A", color: "#fff", },
};

const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 160 },
    { field: 'phone', headerName: 'Phone', width: 160 },
    {
        field: 'course',
        headerName: 'Enquired Course',
        width: 190,
        align: 'left',
        headerAlign: 'left'
    },
    { field: 'source', headerName: 'Source', width: 160 },
    { field: 'status', headerName: 'Status', width: 160 }, 
    {
        field: "disposition",
        headerName: "Disposition",
        width: 180,
        renderCell: (params) => {
            const style = dispositionColors[params.value] || {
                bg: "#BDBDBD",
                color: "#fff",
            };

            return (
                <Chip
                    label={params.value}
                    size="small"
                    sx={{
                        backgroundColor: style.bg,
                        color: style.color,
                        fontWeight: 600,
                        minWidth: 120,
                        justifyContent: "center",
                    }}
                />
            );
        },
    },
    { field: 'attender', headerName: 'Attender', width: 160 },
    { field: 'city', headerName: 'City', width: 150 },
    { field: 'qualification', headerName: 'Qualification', width: 180 },
    { field: 'paid_amount', headerName: 'Paid Amount', width: 140, },
    { field: 'pending_amount', headerName: 'Pending Amount', width: 150, }, 
    { field: 'payment_status', headerName: 'Payment Status', width: 140, },
    { field: 'createdAtFormatted', headerName: 'Created At', width: 200 },
];

const paginationModel = { page: 0, pageSize: 5 };

export default function StudentsTable({ records, refreshRecords }) {
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState(null);
    const [openPopup, setOpenPopup] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { accessToken } = useSelector((state) => state.user);

    useEffect(() => {
        const studentRecord = records.map((item) => {
            const totalPaid = item.payments?.reduce(
                (sum, payment) => sum + (Number(payment.paid_amount) || 0),
                0
            ) || 0;
            return {
            id: item._id,
            name: item.name,
            phone: item.phone,
            course: item.course,
            course_fee: item.course_fee,
            concession_amount: item.concession_amount || 0,
            payable_fee: item.payable_fee || item.course_fee,
            source: item.source,
            status: item.status,
            disposition: item.disposition,
            history: item.history || [],
            attender: item.attender,
            payments: item.payments || [],
            paid_amount: item.payments?.length ? totalPaid : "NA",
            pending_amount: totalPaid > 0 ? item.balance_amount : "NA",
            balance_amount: item.balance_amount || 0,
            payment_status: item.payment_status || "Unpaid",
            city: item.city,
            qualification: item.qualification,
            createdAt: item.createdAt,
            createdAtFormatted: dateFormat(item.createdAt),
        }
    });
        setStudents(studentRecord);
    }, [records]);
    

    const handleUpdate = async (finalData) => {
        try {
            await apiCall('put', `/api/student/${finalData.id}`, finalData, null, accessToken);
            await refreshRecords();
            setOpenPopup(false);
        } catch (error) {
            console.error("Failed to update student", error.message);
        }
    };
    

    const filteredStudents = students.filter((student) => {
        const search = searchQuery.toLowerCase();
        return (
            student.name?.toLowerCase().includes(search) ||
            student.phone?.toLowerCase().includes(search)
        );
    });

    
    const downloadCSV = () => {
        if (!filteredStudents.length) return;

        const data = filteredStudents.map((student) => {
            const latestHistory = student.history?.length ? student.history[student.history.length - 1] : {};
            const leadAge = student.createdAt ? Math.floor( (new Date() - new Date(student.createdAt)) / (1000 * 60 * 60 * 24) ) : "";
            return {
                Name: student.name,
                Phone: student.phone,
                Course: student.course,
                Source: student.source,
                Status: student.status,
                Disposition: student.disposition,
                Attender: student.attender,
                CourseFee: student.course_fee,
                PaidAmount: student.paid_amount,
                BalanceAmount: student.status === "Loss" ? "" : student.balance_amount,
                PaymentStatus: student.status === "Loss" ? "" : student.payment_status,
                City: student.city,
                Qualification: student.qualification,
                Comments: latestHistory.note || "",
                FollowUpDate: latestHistory.follow_up_date ? dateFormat(latestHistory.follow_up_date) : "",
                LastUpdated: latestHistory.updated_at ? dateFormat(latestHistory.updated_at) : "",
                LeadAge: leadAge !== "" ? `${leadAge} Days` : "",
            };
        });
        
        const csv = Papa.unparse(data);

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'filtered_students.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Box sx={{ padding: '20px 10px' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Typography variant='h6'>Students Information</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2}}>
                    <TextField
                        placeholder='Search by name or phone'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        size='small'
                        variant="outlined"
                    />
                    <Button onClick={downloadCSV} variant="outlined" sx={{textTransform: 'capitalize'}}>
                        Download CSV
                    </Button>
                </Box>
            </Box>
            <Paper sx={{ width: '100%' }}>
                <DataGrid
                    rows={filteredStudents}
                    columns={columns}
                    initialState={{ pagination: { paginationModel } }}
                    pageSizeOptions={[5, 10]}
                    onRowClick={(params) => {
                        setFormData(params.row);
                        setOpenPopup(true);
                    }}
                    sx={{
                        border: 0, '& .MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 'bold',
                        },
                    }}
                />
            </Paper>
            <Dialog open={openPopup} onClose={() => setOpenPopup(false)} fullWidth maxWidth="md">
                <DialogTitle>Student Details</DialogTitle>
                <DialogContent>
                    {formData && (<StudentForm formData={formData} setFormData={setFormData} onSubmit={handleUpdate} openPopup={openPopup} setOpenPopup={setOpenPopup} isUpdateMode />)}
                </DialogContent>
            </Dialog>
        </Box>

    );
}
