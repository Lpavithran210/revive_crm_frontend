import { Box, Button, Divider, Grid, MenuItem, Select, styled, TextField, Typography } from "@mui/material"
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Papa from 'papaparse';
import { apiCall } from "../utils/axios";
import { useState } from "react";
import StudentForm from "../components/StudentForm";
import { useSelector } from "react-redux";

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
    const [formData, setFormData] = useState({name: '', phone: '', course: '', are_you: '', currently_working_in: '', learning_mode: '', source: '', status: '', attender: '', follow_up_date: '', note: '', amount: 0, balance_amount: 0, course_fee: 0, payment_status: ''});
    const token = useSelector((state) => state.user.accessToken);

    const handleCSVUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async function(results) {
                let students = results.data
                try {
                    await apiCall('post', '/upload-students', JSON.stringify({students}), null, token)
                }
                catch (e) {
                    console.log('Upload error', e.message)
                }
            },
            error: function(error) {
                console.error(error.message);
            }
        });
    };

    const handleCreateStudent = async (finalData) => {
      try {
          const payload = {
              ...finalData,
              are_you: finalData.are_you === "Experience" ? "Experienced" : "Fresher"
          };
  
          await apiCall('post', '/create-student', payload, null, token);
  
          setFormData({
              name: '',
              phone: '',
              course: '',
              are_you: '',
              currently_working_in: '',
              learning_mode: '',
              source: '',
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
            <Button
                component="label"
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
                sx={{margin:'20px 0', backgroundColor: '#224436', textTransform: 'capitalize'}}
            >
                Upload files
                <VisuallyHiddenInput
                type="file"
                onChange={handleCSVUpload}
                accept=".csv"
                />
            </Button>
            <Divider/>
            <Typography variant="h6" sx={{ margin: '20px 0 30px 0' }}>Student Enquiry Form</Typography>
            <StudentForm formData={formData} setFormData={setFormData} onSubmit={handleCreateStudent} />
        </Box>
    </>
}

export default EnquiryForm