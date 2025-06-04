import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Layout } from './components/layout/Layout';
import { ToastProvider } from './contexts/ToastContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import Users from './pages/Users';
import { Customers } from './pages/Customers';
import { Agents } from './pages/Agents';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Stock } from './pages/Stock';
import { Statistics } from './pages/Statistics';
import { useSelector } from 'react-redux';
import { RootState } from './store';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

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
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
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
