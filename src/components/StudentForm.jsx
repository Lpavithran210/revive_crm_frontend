import { Alert, Box, Button, Divider, FormControl, FormHelperText, Grid, MenuItem, Select, Snackbar, TextField, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const StudentForm = ({ formData, setFormData, onSubmit, setOpenPopup, isUpdateMode = false }) => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [errors, setErrors] = useState({})
    const allUsers = useSelector(state => state.members.allTeams);
    const members = allUsers.filter(user => user.role === 'user')
    const courses = useSelector(state => state.courses.allCourses)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "course") {
            const selectedCourse = courses.find(course => course.title === value);
            setFormData(prev => ({
                ...prev,
                course: value,
                course_fee: selectedCourse?.fee || ""
            }));
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    useEffect(() => {
        const totalPaidAmount = formData.payments?.reduce((acc, payment) => acc + (payment.paid_amount || 0), 0) || 0;

        if (formData.course && courses.length > 0) {
            const selectedCourse = courses.find(course => course.title === formData.course);
            if (selectedCourse && formData.course_fee !== selectedCourse.fee) {
                setFormData(prev => ({
                    ...prev,
                    course_fee: selectedCourse.fee,
                    paid_amount: totalPaidAmount
                }));
            }
        }
    }, [formData.course, courses]);

    const { role } = useSelector((state) => state.user);
    const isUser = role === 'user';

    const dateFormat = (date) => {
        return new Date(date).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Kolkata",
        })
    }

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name?.trim()) newErrors.name = "Name is required";
        if (!formData.phone?.trim()) {
            newErrors.phone = "Phone is required";
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = "Phone must be 10 digits";
        }
        if (!formData.course) newErrors.course = "Course is required";
        if (!formData.are_you) newErrors.are_you = "This field is required";
        if (!formData.currently_working_in) newErrors.currently_working_in = "This field is required";
        if (!formData.learning_mode) newErrors.learning_mode = "Learning mode is required";
        if (!formData.source) newErrors.source = "Source is required";
        if (!formData.status) newErrors.status = "Status is required";
        if (!formData.attender) newErrors.attender = "Attender is required";
        if (formData.status === "Follow up") {
            if (!formData.follow_up_date) newErrors.follow_up_date = "Follow-up time required";
            if (!formData.note?.trim()) newErrors.note = "Note is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = () => {
        if (validateForm()) {
            onSubmit();
            setSnackbarOpen(true);
        }
    };

    return (
        <Box>
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box>
                        <Typography variant='body2'>Name</Typography>
                        <TextField fullWidth size="small" variant="outlined" name="name" disabled={isUser} value={formData.name} onChange={handleInputChange} error={!!errors.name} helperText={errors.name} />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box>
                        <Typography variant='body2'>Phone</Typography>
                        <TextField fullWidth type="number" size="small" variant="outlined" name="phone" disabled={isUser} value={formData.phone} onChange={handleInputChange} error={!!errors.phone} helperText={errors.phone} />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small" error={!!errors.course} disabled={isUser}>
                        <Typography variant='body2'>Course</Typography>
                        <Select fullWidth size="small" name="course" value={formData.course} onChange={handleInputChange}>
                            {courses.map((item) => <MenuItem value={item.title} key={item._id}>{item.title}</MenuItem>)}
                        </Select>
                        {errors.course && <FormHelperText>{errors.course}</FormHelperText>}
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small" error={!!errors.are_you} disabled={isUser}>
                        <Typography variant='body2'>Are you</Typography>
                        <Select fullWidth size="small" name="are_you" value={formData.are_you} onChange={handleInputChange}>
                            <MenuItem value="Fresher">Fresher</MenuItem>
                            <MenuItem value="Experienced">Experienced</MenuItem>
                        </Select>
                        {errors.are_you && <FormHelperText>{errors.are_you}</FormHelperText>}
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small" error={!!errors.currently_working_in} disabled={isUser}>
                        <Typography variant='body2'>Currently working in</Typography>
                        <Select fullWidth size="small" name="currently_working_in" value={formData.currently_working_in} onChange={handleInputChange}>
                            <MenuItem value="IT">IT</MenuItem>
                            <MenuItem value="Non IT">Non IT</MenuItem>
                        </Select>
                        {errors.currently_working_in && <FormHelperText>{errors.currently_working_in}</FormHelperText>}
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small" error={!!errors.learning_mode} disabled={isUser}>
                        <Typography variant='body2'>Learning mode</Typography>
                        <Select fullWidth size="small" name="learning_mode" value={formData.learning_mode} onChange={handleInputChange}>
                            <MenuItem value="Online">Online</MenuItem>
                            <MenuItem value="Offline">Offline</MenuItem>
                        </Select>
                        {errors.learning_mode && <FormHelperText>{errors.learning_mode}</FormHelperText>}
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small" error={!!errors.source} disabled={isUser}>
                        <Typography variant='body2'>Source</Typography>
                        <Select fullWidth size="small" name="source" disabled={isUser} value={formData.source} onChange={handleInputChange} error={!!errors.source} helperText={errors.source}>
                            <MenuItem value="Meta">Meta</MenuItem>
                            <MenuItem value="Instagram">Instagram</MenuItem>
                            <MenuItem value="Website">Website</MenuItem>
                            <MenuItem value="Referral">Referral</MenuItem>
                            <MenuItem value="Direct">Direct</MenuItem>
                        </Select>
                        {errors.source && <FormHelperText>{errors.source}</FormHelperText>}
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small" error={!!errors.attender}>
                        <Typography variant='body2'>Attender</Typography>
                        <Select fullWidth size="small" name="attender" value={formData.attender} onChange={handleInputChange}>
                            {members.map((person, ind) => {
                                return <MenuItem key={ind} value={person.name}>{person.name}</MenuItem>
                            })}
                        </Select>
                        {errors.attender && <FormHelperText>{errors.attender}</FormHelperText>}
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small" error={!!errors.status}>
                        <Typography variant='body2'>Status</Typography>
                        <Select fullWidth size="small" name="status" value={formData.status} onChange={handleInputChange}>
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Follow up">Follow Up</MenuItem>
                            <MenuItem value="Loss">Loss</MenuItem>
                            <MenuItem value="Success">Success</MenuItem>
                        </Select>
                        {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                    </FormControl>
                </Grid>
                {formData.status === 'Follow up' && (
                    <>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box>
                                <Typography variant="body2">Follow-up time</Typography>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker
                                        value={formData.follow_up_date ? dayjs(formData.follow_up_date) : null}
                                        minDate={dayjs()}
                                        onChange={(newValue) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                follow_up_date: newValue ? newValue.toISOString() : ''
                                            }));
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
                                                error: !!errors.follow_up_date,
                                                helperText: errors.follow_up_date,
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box>
                                <Typography variant="body2">Note</Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    size="small"
                                    variant="outlined"
                                    name="note"
                                    value={formData.note}
                                    onChange={handleInputChange}
                                    error={!!errors.note}
                                    helperText={errors.note}
                                />
                            </Box>
                        </Grid>
                    </>
                )}
                {formData.payment_status !== 'Fully Paid' && <>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant='body2'>Enter Amount</Typography>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            name="amount"
                            value={formData.amount || ''}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <Typography variant="body2">Payment Mode</Typography>
                            <Select
                                name="payment_mode"
                                value={formData.payment_mode || ''}
                                onChange={handleInputChange}
                            >
                                <MenuItem value="Cash">Cash</MenuItem>
                                <MenuItem value="UPI">UPI</MenuItem>
                                <MenuItem value="Card">Card</MenuItem>
                                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid></>}

                {formData.payment_status === 'Partially Paid' && (<>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant='body2'>Paid Amount</Typography>
                        <Typography variant='body1' sx={{mt:'5px'}}>{formData.paid_amount?.toLocaleString() || 0}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <Typography variant='body2'>Balance amount</Typography>
                            <Typography variant='body1' sx={{mt:'5px'}}>{formData.balance_amount?.toLocaleString()}</Typography>
                        </FormControl>
                    </Grid>
                </>
                )}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='body2'>Course fee</Typography>
                    <Typography variant='body1'sx={{mt:'5px'}}>{formData.course_fee?.toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small">
                        <Typography variant='body2'>Payment Status</Typography>
                        <Typography variant='body1'>{formData.payment_status}</Typography>
                    </FormControl>
                </Grid>
                {formData.payments?.length > 0 && <Grid size={{ xs: 12 }}>
                    <Typography variant="body1" fontWeight={600} sx={{ backgroundColor: '#c4c4c4', padding: 1, marginBottom: 1 }}>Payment History</Typography>
                    <Grid container spacing={2}>
                        {formData.payments.map((item) => {
                            return (
                                <>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Typography variant="body2" fontWeight={600}>Date</Typography>
                                        <Typography variant="body2" color="textSecondary">{dateFormat(item.payment_date)}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Typography variant="body2" fontWeight={600}>Mode</Typography>
                                        <Typography variant="body1">{item.payment_mode}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Typography variant="body2" fontWeight={600}>Amount</Typography>
                                        <Typography variant="body1">{item.paid_amount?.toLocaleString()}</Typography>
                                    </Grid>
                                </>
                            );
                        })}
                    </Grid>
                </Grid>}
                {formData.history?.length > 0 && <Grid size={{ xs: 12 }}>
                    <Typography variant="body1" fontWeight={600} sx={{ backgroundColor: '#c4c4c4', padding: 1, marginBottom: 1 }}>All History</Typography>
                    <Grid container spacing={2}>
                        {formData.history.map((item) => {
                            return (
                                <>
                                    <Grid size={{ xs: 12, sm: 3 }}>
                                        <Typography variant="body2" fontWeight={600}>Date</Typography>
                                        <Typography variant="body2" color="textSecondary">{dateFormat(item.updated_at)}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 3 }}>
                                        <Typography variant="body2" fontWeight={600}>Attender</Typography>
                                        <Typography variant="body1">{item.attender}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 3 }}>
                                        <Typography variant="body2" fontWeight={600}>Status</Typography>
                                        <Typography variant="body1">{item.status}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 3 }}>
                                        <Typography variant="body2" fontWeight={600}>Note</Typography>
                                        <Typography variant="body1">{item.note}</Typography>
                                    </Grid>
                                </>
                            );
                        })}
                    </Grid>
                </Grid>}
            </Grid>
            <Box sx={{display: 'flex', justifyContent: 'end', gap: 2}}>
            {isUpdateMode && <Button variant="outlined" sx={{ textTransform: 'capitalize', border:'1px solid #224436', mt: '30px', color: '#224436' }} onClick={() => setOpenPopup(false)}>Cancel</Button>}
            <Button variant="contained" sx={{ textTransform: 'capitalize', border:'1px solid #224436', mt: '30px', backgroundColor: '#224436' }} onClick={handleFormSubmit}>{isUpdateMode ? 'Update' : 'Create'}</Button>
            </Box>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                    Form submitted successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default StudentForm;
