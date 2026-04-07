import { Box } from '@mui/material'
import './App.css'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ErrorPage from './pages/404'

const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Login = lazy(() => import('./pages/Login'))
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'))
const Home = lazy(() => import('./pages/Home'))
const ProtectedRoute = lazy(() => import('./pages/ProtectedRoute'))
const EnquiryForm = lazy(() => import('./pages/EnquiryForm'))
const Users = lazy(() => import('./pages/Users'))
const Course = lazy(() => import('./pages/Course'))

// const ErrorPage = lazy(() => import('./pages/404'))
// const CreatePost = lazy(() => import('./pages/blogs/CreateBlog'))
// const PersonalBlogs = lazy(() => import('./pages/blogs/PersonalBlogs'))
// const Profile = lazy(() => import('./pages/Profile'))
// const EditProfile = lazy(() => import('./pages/EditProfile'))
// const Dashboard = lazy(() => import('./pages/Dashboard'))
// const BlogDetails = lazy(() => import('./pages/blogs/BlogDetails'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Box sx={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src='./revivelogo.png' width={100} /></Box>}>
        <Routes>
          <Route path='/signin' element={<Login />} />
          <Route path='/forgot_password' element={<ForgotPassword />} />
          <Route path='/verify_otp' element={<VerifyOTP />} />
          <Route path='/reset_password' element={<ResetPassword />} />
          <Route element={<ProtectedRoute allowedRoles={['admin', 'user']} />}>
            <Route path='/signin' element={<Navigate to='/' />} />
            <Route path='/forgot_password' element={<Navigate to='/' />} />
            <Route path='/verify_otp' element={<Navigate to='/' />} />
            <Route path='/' element={<Home />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/enquiry" element={<EnquiryForm />} />
            <Route path="/team" element={<Users />} />
            <Route path="/course" element={<Course />} />
          </Route>
          
          <Route path='*' element={<ErrorPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App