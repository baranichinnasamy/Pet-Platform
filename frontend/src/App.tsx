import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './layouts/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PetsPage from './pages/PetsPage';
import AdminDashboard from './pages/AdminDashboard';
import PlaceholderPage from './pages/PlaceholderPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="pets" element={<PetsPage />} />
              <Route
                path="auctions"
                element={
                  <PlaceholderPage
                    title="Pet Auctions"
                    description="Live real-time bidding on pets. Phase 2 will include auction creation, bid validation, and Socket.IO updates."
                  />
                }
              />
              <Route
                path="marketplace"
                element={
                  <PlaceholderPage
                    title="Pet Essentials Marketplace"
                    description="Browse and purchase pet food, toys, beds, and grooming products. Phase 3."
                  />
                }
              />
              <Route
                path="services"
                element={
                  <PlaceholderPage
                    title="Pet Hospitality Services"
                    description="Book boarding, daycare, grooming, and training services. Phase 4."
                  />
                }
              />
              <Route
                path="admin"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
