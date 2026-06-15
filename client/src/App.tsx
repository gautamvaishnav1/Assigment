import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Products from './pages/Products';
import Home from './pages/Home';
import Profile from './pages/Profile';
import DashboardLayout from './layout/DashboardLayout';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />

        {/* Dashboard routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/products" element={<Products />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </Router>
  );
};

export default App;