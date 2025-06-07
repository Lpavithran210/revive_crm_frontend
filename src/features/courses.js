import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiCall } from "../utils/axios";
const initialState = {
    allCourses: [] 
}

export const fetchCourses = createAsyncThunk('/courses', async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const accessToken = state.user.accessToken; 
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