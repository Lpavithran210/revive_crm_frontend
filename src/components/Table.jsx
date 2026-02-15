import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Box, Button, Dialog, DialogContent, DialogTitle, InputAdornment, TextField, Typography } from '@mui/material';
import StudentForm from './StudentForm';
import SearchIcon from '@mui/icons-material/Search';
import { apiCall } from '../utils/axios';
import Papa from 'papaparse';
import { useSelector } from 'react-redux';

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
    { field: 'are_you', headerName: 'Experience', width: 160 },
    { field: 'currently_working_in', headerName: 'Working In', width: 160 },
    { field: 'learning_mode', headerName: 'Learning Mode', width: 160 },
    { field: 'source', headerName: 'Source', width: 160 },
    { field: 'status', headerName: 'Status', width: 160 },
    { field: 'attender', headerName: 'Attender', width: 160 },
];

const paginationModel = { page: 0, pageSize: 5 };

export default function StudentsTable({ records, refreshRecords }) {
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState(null);
    const [openPopup, setOpenPopup] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { accessToken } = useSelector((state) => state.user);

    useEffect(() => {
        const studentRecord = records.map((item) => ({
            id: item._id,
            name: item.name,
            phone: item.phone,
            are_you: item.are_you,
            course: item.course,
            course_fee: item.course_fee,
            currently_working_in: item.currently_working_in,
            learning_mode: item.learning_mode,
            source: item.source,
            status: item.status,
            history: item.history || [],
            attender: item.attender,
            payments: item.payments || [],
            balance_amount: item.balance_amount || 0,
            payment_status: item.payment_status || "Unpaid",
        }));
        setStudents(studentRecord);
    }, [records]);
    

    const handleUpdate = async (finalData) => {
        try {
            await apiCall('put', `/student/${finalData.id}`, finalData, null, accessToken);
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
        
        const data = filteredStudents.map(({ name, phone, course, are_you, currently_working_in, learning_mode, source, status, attender, payment_status, paid_amount, balance_amount, course_fee }) => ({
            Name: name,
            Phone: phone,
            Course: course,
            Experience: are_you,
            WorkingIn: currently_working_in,
            LearningMode: learning_mode,
            Source: source,
            Status: status,
            Attender: attender,
            CourseFee: course_fee,
            PaidAmount: paid_amount,
            BalanceAmount: status === "Loss" ? "" : balance_amount,
            PaymentStatus: status === "Loss" ? "" : payment_status,
        }));
        
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
