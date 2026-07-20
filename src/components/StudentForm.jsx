import { Alert, Box, Button, Divider, FormControl, FormHelperText, Grid, MenuItem, Select, Snackbar, TextField, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export const dateFormat = (date) => {
        return new Date(date).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Kolkata",
        })
    }

const StudentForm = ({ formData, setFormData, onSubmit, setOpenPopup, isUpdateMode = false }) => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [errors, setErrors] = useState({})
    const allUsers = useSelector(state => state.members.members);
    const members = allUsers.filter(user => user.role === 'counsellor')
    const courses = useSelector(state => state.courses.allCourses)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "course") {
            const selectedCourse = courses.find(course => course.title === value);
            const courseFee = Number(selectedCourse?.fee || 0);
            const concession = Number(formData.concession_amount || 0);

            setFormData(prev => ({
                ...prev,
                course: value,
                course_fee: courseFee,
                payable_fee: courseFee - concession
            }));
        }
        else if (name === "payment_mode") {
            setFormData(prev => ({
                ...prev,
                payment_mode: value
            }));
        }
        else if (name === "concession_amount") {
            const concession = Number(value || 0);
            const courseFee = Number(formData.course_fee || 0);

            setFormData(prev => ({
                ...prev,
                concession_amount: concession,
                payable_fee: courseFee - concession
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
        if (!formData.course || courses.length === 0) return;
    
        const selectedCourse = courses.find(
            course => course.title === formData.course
        );
    
        if (selectedCourse) {
            setFormData(prev => ({
                ...prev,
                course_fee: selectedCourse.fee,
                payable_fee: Number(selectedCourse.fee) - Number(prev.concession_amount || 0)
            }));
        }
    }, [formData.course, courses]);
    

    const { role } = useSelector((state) => state.user);
    const isUser = role === 'user';
    const isAdmin = role === 'admin';
    const isCounsellor = role === 'counsellor';

    const disableForCounsellorAndUser = isCounsellor || isUser;

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name?.trim()) newErrors.name = "Name is required";
        if (!formData.phone?.trim()) {
            newErrors.phone = "Phone is required";
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = "Phone must be 10 digits";
        }
        if (!formData.course) newErrors.course = "Course is required";
        if (!formData.source) newErrors.source = "Source is required";
        if (!formData.status) newErrors.status = "Status is required";
        if (isUpdateMode && !formData.attender) newErrors.attender = "Attender is required";
        if (formData.status === "Follow up") {
            if (!formData.follow_up_date) newErrors.follow_up_date = "Follow-up time required";
        }
        if (formData.status === "Follow up" || formData.status === "Loss") {
            if (!formData.note?.trim()) newErrors.note = "Note is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const processPaymentOnCreate = () => {
        if (!formData.amount || Number(formData.amount) <= 0) return null;
    
        return {
            paid_amount: Number(formData.amount),
            payment_mode: formData.payment_mode,
            payment_date: new Date().toISOString()
        };
    };

    useEffect(() => {
        const totalPaid = formData.payments?.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0) || 0;
         setFormData(prev => {
            const courseFee = Number(prev.course_fee || 0);
            const concession = Number(prev.concession_amount || 0);
            const payableFee = courseFee - concession;
            const balanceAmount = Math.max(payableFee - totalPaid, 0);

            return {
                ...prev,
                payable_fee: payableFee,
                paid_amount: totalPaid,
                balance_amount: balanceAmount,
                payment_status: totalPaid === 0 ? "Unpaid" : balanceAmount > 0 ? "Partially Paid" : "Fully Paid"
            };
        });
    }, [formData.payments, formData.course_fee, formData.concession_amount]);
    
    const handleFormSubmit = () => {
        if (isUser) return;
        if (!validateForm()) return;
        
        let updatedPayments = [...(formData.payments || [])];
        const newPayment = processPaymentOnCreate();

        if (newPayment) {
            updatedPayments.push(newPayment);
        }

        const totalPaid = updatedPayments.reduce( (sum, payment) => sum + Number(payment.paid_amount || 0), 0 );
        const payableFee = Number(formData.course_fee || 0) - Number(formData.concession_amount || 0);
        const balanceAmount = Math.max(payableFee - totalPaid, 0);
    
        let paymentStatus = "Unpaid";
        if (totalPaid > 0 && balanceAmount > 0) paymentStatus = "Partially Paid";
        if (balanceAmount <= 0) paymentStatus = "Fully Paid";
    
        // ✅ NEW history entry (USES CURRENT VALUES)
        const newHistory = {
            status: formData.status,
            note: formData.note || "Lead created",
            attender: formData.attender,
            course: formData.course,
            updated_at: new Date().toISOString()
        };
    
        const updatedHistory = [...(formData.history || [])];
    
        if (!isUpdateMode && updatedHistory.length === 0) {
            updatedHistory.push(newHistory);
        }

        if (isUpdateMode) {
    const lastHistory = updatedHistory[updatedHistory.length - 1];

    if (
        !lastHistory ||
        lastHistory.status !== formData.status ||
        lastHistory.attender !== formData.attender ||
        lastHistory.note !== formData.note
    ) {
        updatedHistory.push(newHistory);
    }
}
        // ✅ BUILD FINAL PAYLOAD EXPLICITLY
        const payload = {
            ...formData,
            payable_fee: payableFee,
            concession_amount: Number(formData.concession_amount || 0),
            payments: updatedPayments,
            paid_amount: totalPaid,
            balance_amount: balanceAmount,
            payment_status: paymentStatus,
            history: updatedHistory
        };
    
        // optional UI update
        setFormData(payload);
    
        // ✅ SEND CLEAN DATA
        onSubmit(payload);

        setFormData(prev => ({
            ...prev,
            amount: "",
            payment_mode: ""
        }));
    
        setSnackbarOpen(true);
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
                        <TextField fullWidth type="number" size="small" variant="outlined" name="phone" disabled={disableForCounsellorAndUser} value={formData.phone} onChange={handleInputChange} error={!!errors.phone} helperText={errors.phone} />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box>
                        <Typography variant='body2'>City</Typography>
                        <TextField fullWidth type="text" size="small" variant="outlined" name="city" disabled={disableForCounsellorAndUser} value={formData.city} onChange={handleInputChange} error={!!errors.city} helperText={errors.city} />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small" error={!!errors.source} disabled={disableForCounsellorAndUser}>
                        <Typography variant='body2'>Source</Typography>
                        <Select fullWidth size="small" name="source" disabled={disableForCounsellorAndUser} value={formData.source} onChange={handleInputChange} error={!!errors.source} helperText={errors.source}>
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
                    <Box>
                        <Typography variant='body2'>Qualification</Typography>
                        <TextField fullWidth size="small" variant="outlined" name="qualification" disabled={isUser} value={formData.qualification} onChange={handleInputChange} error={!!errors.qualification} helperText={errors.qualification} />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small" error={!!errors.course}>
                        <Typography variant='body2'>Course</Typography>
                        <Select fullWidth size="small" name="course" disabled={isUser} value={formData.course} onChange={handleInputChange}>
                            {courses.map((item) => <MenuItem value={item.title} key={item._id}>{item.title}</MenuItem>)}
                        </Select>
                        {errors.course && <FormHelperText>{errors.course}</FormHelperText>}
                    </FormControl>
                </Grid>
                {isUpdateMode && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small" error={!!errors.attender}>
                        <Typography variant='body2'>Attender</Typography>
                        <Select fullWidth size="small" name="attender" disabled={isUser} value={formData.attender} onChange={handleInputChange}>
                            {members.map((person, ind) => {
                                console.log(person)
                            return <MenuItem key={ind} value={person.name}>{person.name}</MenuItem>
                        })}
                    </Select>
                    {errors.attender && <FormHelperText>{errors.attender}</FormHelperText>}
                </FormControl>
                </Grid>)}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small" error={!!errors.status}>
                        <Typography variant='body2'>Status</Typography>
                        <Select fullWidth size="small" name="status" disabled={isUser} value={formData.status} onChange={handleInputChange}>
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Follow up">Follow Up</MenuItem>
                            <MenuItem value="Loss">Loss</MenuItem>
                            <MenuItem value="Success">Success</MenuItem>
                        </Select>
                        {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                    </FormControl>
                </Grid>
                {isUpdateMode && <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small" error={!!errors.disposition}>
                        <Typography variant='body2'>Disposition</Typography>
                        <Select fullWidth size="small" name="disposition" disabled={isUser} value={formData.disposition} onChange={handleInputChange}>
                            <MenuItem value="RNR">RNR</MenuItem>
                            <MenuItem value="Callback">Callback</MenuItem>
                            <MenuItem value="Interested">Interested</MenuItem>
                            <MenuItem value="Not Interested">Not Interested</MenuItem>
                            <MenuItem value="Not Qualified">Not Qualified</MenuItem>
                            <MenuItem value="Demo Scheduled">Demo Scheduled</MenuItem>
                            <MenuItem value="Demo Completed">Demo Completed</MenuItem>
                            <MenuItem value="Visit">Visit</MenuItem>
                        </Select>
                        {errors.disposition && <FormHelperText>{errors.disposition}</FormHelperText>}
                    </FormControl>
                </Grid>}
                {formData.status === 'Follow up' && (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box>
                                <Typography variant="body2">Follow-up time</Typography>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker
                                        disabled={isUser}
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
                        </Grid> )}
                {formData.status === 'Follow up' || formData.status === 'Loss' ? (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box>
                            <Typography variant="body2">Note</Typography>
                            <TextField
                                    disabled={isUser}
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
                ) : null}
                {formData.status === 'Follow up' && formData.payment_status !== 'Fully Paid' && <>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant='body2'>Enter Amount</Typography>
                        <TextField
                            disabled={isUser}
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
                                disabled={isUser}
                                name="payment_mode"
                                value={formData.payment_mode || ''}
                                onChange={handleInputChange}
                            >
                                <MenuItem value="EMI">EMI</MenuItem>
                                <MenuItem value="Cash">Cash</MenuItem>
                                <MenuItem value="UPI">UPI</MenuItem>
                                <MenuItem value="Card">Card</MenuItem>
                                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid></>}

                {formData.payment_status !== 'Unpaid' && (<>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant='body2'>Paid Amount</Typography>
                        <Typography variant='body1' sx={{mt:'5px'}}>{formData.paid_amount?.toLocaleString() || 0}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <Typography variant='body2'>Balance amount</Typography>
                            <Typography variant='body1' sx={{mt:'5px'}}>{formData.balance_amount?.toLocaleString() || 0}</Typography>
                        </FormControl>
                    </Grid>
                </>
                )}
                {isUpdateMode && <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='body2'>Concession Amount</Typography>
                    <TextField
                        disabled={isUser}
                        fullWidth
                        size="small"
                        type="number"
                        name="concession_amount"
                        value={formData.concession_amount || ''}
                        onChange={handleInputChange}
                    />
                </Grid>}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant='body2'>Course fee</Typography>
                    <Typography variant='body1'sx={{mt:'5px'}}>{formData.course_fee?.toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="body2">Payable Fee</Typography>
                    <Typography variant="body1" sx={{ mt: "5px" }}>
                        {(formData.payable_fee)?.toLocaleString()}
                    </Typography>
                </Grid>
                {isUpdateMode && <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small">
                        <Typography variant='body2'>Payment Status</Typography>
                        <Typography variant='body1'>{formData.payment_status}</Typography>
                    </FormControl>
                </Grid>}
                {isUpdateMode && formData.payments?.length > 0 && <Grid size={{ xs: 12 }}>
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
                {isUpdateMode && formData.history?.length > 0 && <Grid size={{ xs: 12 }}>
                    <Typography variant="body1" fontWeight={600} sx={{ backgroundColor: '#c4c4c4', padding: 1, marginBottom: 1 }}>All History</Typography>
                        {formData.history.map((item,index) => (
                            <Box key={index} sx={{pb: 2}}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 3 }}>
                                        <Typography variant="body2" fontWeight={600}>Date</Typography>
                                        <Typography variant="body2" color="textSecondary">{dateFormat(item.updated_at)}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 2 }}>
                                        <Typography variant="body2" fontWeight={600}>Attender</Typography>
                                        <Typography variant="body1">{item.attender}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 2 }}>
                                        <Typography variant="body2" fontWeight={600}>Status</Typography>
                                        <Typography variant="body1">{item.status}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 2 }}>
                                        <Typography variant="body2" fontWeight={600}>Course</Typography>
                                        <Typography variant="body1">{item.course}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 3 }}>
                                        <Typography variant="body2" fontWeight={600}>Note</Typography>
                                        <Typography variant="body1">{item.note}</Typography>
                                    </Grid>
                                </Grid>
                                {index !== formData.history.length - 1 && (
                                    <Divider sx={{ display: { xs: 'block', sm: 'none' }, my: 2 }} />
                                )}
                            </Box>
                        ))}
                </Grid>}
            </Grid>
            <Box sx={{display: 'flex', justifyContent: 'end', gap: 2}}>
            <Button variant="outlined" sx={{ textTransform: 'capitalize', border:'1px solid #224436', mt: '30px', color: '#224436' }} onClick={() => setOpenPopup(false)}>Cancel</Button>
            {!isUser && <Button variant="contained" sx={{ textTransform: 'capitalize', border:'1px solid #224436', mt: '30px', backgroundColor: '#224436' }} onClick={handleFormSubmit}>{isUpdateMode ? 'Update' : 'Create'}</Button>}
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
