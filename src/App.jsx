import './App.css'
import NavigationBar from './components/layout/NavigationBar'
import CookieConsent from './components/layout/CookieConsent'
import AppRoutes from './components/common/AppRoutes'
import Footer from './components/layout/Footer'
import GoToTopButton from './components/layout/GoToTopButton'
import ScrollToTop from './components/common/ScrollToTop'
import PageTransitionOverlay from './components/layout/PageTransitionOverlay'
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
      <PageTransitionOverlay>
        <AppRoutes />
      </PageTransitionOverlay>

      <div>
        <Footer />
      </div>
      <CookieConsent />
    </>
  )
}

export default App
