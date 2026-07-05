import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Layout } from './components/layout/Layout';
import { ToastProvider } from './contexts/ToastContext';
import { Login } from './pages/Login';
import { useSelector } from 'react-redux';
import { RootState } from './store';

// Tách code theo route: mỗi trang là một chunk riêng, chỉ tải khi điều hướng tới.
// Login giữ import tĩnh vì luôn là màn hình đầu tiên (không cần tách).
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Users = lazy(() => import('./pages/Users'));
const Customers = lazy(() => import('./pages/Customers').then(m => ({ default: m.Customers })));
const Agents = lazy(() => import('./pages/Agents').then(m => ({ default: m.Agents })));
const Products = lazy(() => import('./pages/Products').then(m => ({ default: m.Products })));
const Categories = lazy(() => import('./pages/Categories').then(m => ({ default: m.Categories })));
const Orders = lazy(() => import('./pages/Orders').then(m => ({ default: m.Orders })));
const Stock = lazy(() => import('./pages/Stock').then(m => ({ default: m.Stock })));
const Statistics = lazy(() => import('./pages/Statistics').then(m => ({ default: m.Statistics })));

// Fallback hiển thị trong lúc chunk của trang đang tải.
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-96">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
  </div>
);

// App Router component
const AppRouter: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AppRouter />
          </div>
        </Router>
      </ToastProvider>
    </Provider>
  );
};

export default App;
