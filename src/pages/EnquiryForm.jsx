import { Box, Button, Divider, Grid, MenuItem, Select, styled, TextField, Typography } from "@mui/material"
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Papa from 'papaparse';
import { apiCall } from "../utils/axios";
import { useMemo, useState } from "react";
import StudentForm from "../components/StudentForm";
import { useSelector } from "react-redux";
import { Snackbar, Alert } from "@mui/material";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const EnquiryForm = () => {
    const [formData, setFormData] = useState({ paid_amount: 0, name: '', phone: '', course: '', city: '', source: '', status: '', attender: '', follow_up_date: '', note: '', balance_amount: 0, course_fee: 0, payment_status: '' });

    const token = useSelector((state) => state.user.accessToken);
    const courses = useSelector(state => state.courses.allCourses)
    
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    
   const formatCourseTitle = (text) => {
        if (!text) return null;
        return text.toLowerCase().replace(/_+/g, " ").replace(/\bcampaign\b/g, "").trim().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    };
    
    const cleanPhoneNumber = (phone) => {
        if (!phone) return null;
        const cleaned = phone.toString().replace(/^p:/i, '').replace(/\D/g, '').slice(-10);
        return /^[6-9]\d{9}$/.test(cleaned) ? cleaned : null;
    };

    const courseLookup = useMemo(() => {
        return courses.reduce((acc, c) => {
            acc[c.title.toLowerCase()] = c;
            return acc;
        }, {});
    }, [courses]);
    
    const handleCSVUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async function (results) {

                const students = results.data.map((row) => {
                    const courseText = (row.are_you_interested_in || row.campaign_name)?.replace(/\b(hiring|campaign|course)\b/g, '').replace(/\s+/g, ' ').trim();
                    const formattedCourse = formatCourseTitle(courseText);
                    const matchedCourse = courseLookup[formattedCourse?.toLowerCase()];
                    return {
                        name: row.full_name?.trim(),
                        phone: cleanPhoneNumber(row.phone),
                        city: row.city,
                        source: row.platform === "fb" ? "Meta" : "Instagram",
                        learning_mode: row.mode_of_training,
                        qualification: row.highest_educational_qualification,
                        course: formattedCourse,
                        course_fee: matchedCourse?.fee || 0,
                        payments: [],
                        paid_amount: 0,
                        balance_amount: matchedCourse?.fee || 0,
                        payment_status: "Unpaid"
                    };
                }).filter(student => student.phone);
                try {
                    await apiCall('post', '/api/upload-students', JSON.stringify({ students }), null, token);
                    setSnackbar({ open: true, message: "Students uploaded successfully", severity: "success" });
                } catch (e) {
                    console.log('Upload error', e.message);
                    setSnackbar({ open: true, message: "Failed to upload students", severity: "error" });
                }
            },
            error: function (error) {
                console.error(error.message);
                setSnackbar({ open: true, message: "Failed to upload students", severity: "error" });
            }
        });
    };

    const handleCreateStudent = async (finalData) => {
        try {
            await apiCall('post', '/api/create-student', finalData, null, token);

            setFormData({
                name: '',
                phone: '',
                course: '',
                city: '',
                source: '',
                learning_mode: '',
                qualification: '',
                status: '',
                attender: '',
                payments: [],
                course_fee: 0,
                paid_amount: 0,
                balance_amount: 0,
                payment_status: 'Unpaid'
            });

        } catch (err) {
            console.error("Create student error", err.message);
        }
    };

    return <>
        <Box sx={{ padding: 2 }}>
            <Typography variant="h6">Upload CSV</Typography>
            <Button component="label" variant="contained" tabIndex={-1} startIcon={<CloudUploadIcon />} sx={{ margin: '20px 0', backgroundColor: '#224436', textTransform: 'capitalize' }}>
                Upload files
                <VisuallyHiddenInput type="file" onChange={handleCSVUpload} accept=".csv"/>
            </Button>
            <Divider />
            <Typography variant="h6" sx={{ margin: '20px 0 30px 0' }}>Student Enquiry Form</Typography>
            <StudentForm formData={formData} setFormData={setFormData} onSubmit={handleCreateStudent} />
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    </>
}

export default EnquiryForm