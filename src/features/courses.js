import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiCall } from "../utils/axios";
import { useSelector } from "react-redux";
const initialState = {
    allCourses: [] 
}

export const fetchCourses = createAsyncThunk('/courses', async () => {
    const { accessToken } = useSelector((state) => state.user);
    const res = await apiCall('get', '/course', null, null, accessToken)
    return res.data
}) 

export const courseSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {
        allCourse: (state, action) => {
            state.allCourses = action.payload
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchCourses.fulfilled, (state, action) => {
            state.allCourses = action.payload
        })
    }
})

export default courseSlice.reducer
export const {allCourse} = courseSlice.actions