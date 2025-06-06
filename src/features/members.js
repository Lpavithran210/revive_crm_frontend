import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    allTeams: [] 
}

export const memberSlice = createSlice({
    name: 'members',
    initialState,
    reducers: {
        allMembers : (state, action) => {
            state.allTeams = action.payload
        }
    }
})


export default memberSlice.reducer
export const {allMembers} = memberSlice.actions