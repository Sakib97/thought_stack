import './App.css'
import NavigationBar from './components/layout/NavigationBar'
import AppRoutes from './components/common/AppRoutes'
import Footer from './components/layout/Footer'
import GoToTopButton from './components/layout/GoToTopButton'

function App() {
  return (
    <>
      <div>
        <NavigationBar />
      </div>
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
    </>
  )
}

export default App
