import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import { CategoriesProvider } from './hooks/useCategories';
import { ThemeProvider } from './hooks/useTheme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import BecomeAdmin from './pages/BecomeAdmin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Categories from './pages/Categories';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CategoriesProvider>
            <Router>
              <div className="min-h-screen flex flex-col bg-cream-50 dark:bg-charcoal-950 transition-colors duration-400">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/post/:slug" element={<PostDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/become-admin" element={<BecomeAdmin />} />
                    <Route path="/superadmin" element={<SuperAdminDashboard />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'dark:bg-charcoal-800 dark:text-cream-100 dark:border-dark',
              }}
            />
          </CategoriesProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
