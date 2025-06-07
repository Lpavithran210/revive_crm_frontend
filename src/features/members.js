import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiCall } from "../utils/axios";

const initialState = {
    members: []
}

export const fetchMembers = createAsyncThunk('/members', async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const accessToken = state.user.accessToken;
    const res = await apiCall('get', '/user/members', null, null, accessToken)
    return res.data
})

export const memberSlice = createSlice({
    name: 'members',
    initialState,
    reducers: {
        allMembers: (state, action) => {
            state.members = action.payload
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchMembers.fulfilled, (state, action) => {
            state.members = action.payload
        })
    }
})


export default memberSlice.reducer
export const { allMembers } = memberSlice.actions