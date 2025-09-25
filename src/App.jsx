import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import NavigationBar from './components/layout/NavigationBar'
import AuthPage from './features/auth/pages/authPage'
import LoginForm from './features/auth/components/LoginForm'
import { Route, Routes } from 'react-router-dom'

function App() {

  return (
    <>
      <div>
        <NavigationBar />
      </div>
      
        <Routes>
          <Route path='/auth' element={<AuthPage />}>
            <Route path='login' element={<LoginForm />} />
          </Route>
        </Routes>
    </>
  )
}

export default App
