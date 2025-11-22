import './App.css'
import NavigationBar from './components/layout/NavigationBar'
import CookieConsent from './components/layout/CookieConsent'
import AppRoutes from './components/common/AppRoutes'
import Footer from './components/layout/Footer'
import GoToTopButton from './components/layout/GoToTopButton'
import ScrollToTop from './components/common/ScrollToTop'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <>
      <ScrollToTop />
      <div>
        <NavigationBar />
      </div>
      <Toaster />
      <GoToTopButton />


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
      <CookieConsent />
    </>
  )
}

export default App
