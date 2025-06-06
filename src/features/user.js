import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  accessToken: null,
  role: null,
  isLoggedIn: false,
  name: null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      const { accessToken, role, name } = action.payload
      state.accessToken = accessToken
      state.role = role
      state.name = name
      state.isLoggedIn = true
    },
    logout: (state) => {
      state.accessToken = null
      state.role = null
      state.isLoggedIn = false
    }
  },
})

export const { login, logout } = userSlice.actions
export default userSlice.reducer
