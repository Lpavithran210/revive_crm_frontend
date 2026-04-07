import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  accessToken: null,
  role: null,
  isLoggedIn: false,
  name: null,
  _id: null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      const { accessToken, role, name, _id } = action.payload
      state.accessToken = accessToken
      state.role = role
      state.name = name
      state._id = _id
      state.isLoggedIn = true
    },
    logout: (state) => {
      state.accessToken = null
      state.role = null
      state.name = null
      state._id = null
      state.isLoggedIn = false
    }
  },
})

export const { login, logout } = userSlice.actions
export default userSlice.reducer
