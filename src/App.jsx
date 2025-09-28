import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import NavigationBar from './components/layout/NavigationBar'
import AuthPage from './features/auth/pages/authPage'
import LoginForm from './features/auth/components/LoginForm'
import { Route, Routes } from 'react-router-dom'
import HomePage from './features/home/pages/HomePage'
import WriteArticlePage from './features/articles/pages/WriteArticlePage'
import ProtectedRoute from './components/common/ProjectedRoute'
import ProfilePage from './features/dashboard/pages/ProfilePage'
import AuthRedirect from './components/common/AuthRedirect'
import NotFound from './components/common/NotFound'
import DashboardPage from './features/dashboard/pages/DashboardPage'
import AppRoutes from './components/common/AppRoutes'
import Footer from './components/layout/Footer'

function App() {
  return (
    <>
      <div>
        <NavigationBar />
      </div>

      {/* <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/articles/write' element={<WriteArticlePage />} />
        <Route path='/auth' element={<AuthPage />}>
          <Route path='signin' element={
            <AuthRedirect>
              <LoginForm />
            </AuthRedirect>
          } />
        </Route>

        <Route path='/dashboard' element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }> </Route>

        <Route path="*" element={<NotFound />} />
      </Routes> */}

      <AppRoutes />

      <div>
        <Footer />
      </div>
    </>
  )
}

export default App
