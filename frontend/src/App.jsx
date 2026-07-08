import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateListingPage from './pages/CreateListingPage';
import SellerListingsPage from './pages/SellerListingsPage';
import AdminListingsPage from './pages/AdminListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import AllListingsPage from './pages/AllListingsPage';
import EditListingPage from './pages/EditListingPage';
import FavoritesPage from './pages/FavoritesPage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthContext from './context/AuthContext';
import './App.css';

function App() {
  const parseToken = (jwt) => {
    if (!jwt) return null;
    try {
      return JSON.parse(atob(jwt.split('.')[1]));
    } catch {
      return null;
    }
  };

  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => parseToken(localStorage.getItem('token')));
  const navigate = useNavigate();

  const login = (jwtToken) => {
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    setUser(parseToken(jwtToken));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <div className="App">

        {/* ── Navbar ── */}
        <Navbar />

        {/* ── Routes ── */}
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings" element={<AllListingsPage />} />
            <Route path="/favorites" element={<PrivateRoute><FavoritesPage /></PrivateRoute>} />
            <Route path="/listing/:id" element={<ListingDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/seller/create-listing" element={
              <PrivateRoute requiredRole="seller"><CreateListingPage /></PrivateRoute>
            } />
            <Route path="/seller/my-listings" element={
              <PrivateRoute requiredRole="seller"><SellerListingsPage /></PrivateRoute>
            } />
            <Route path="/listings/edit/:id" element={
              <PrivateRoute><EditListingPage /></PrivateRoute>
            } />
            <Route path="/admin/listings" element={
              <AdminRoute><AdminListingsPage /></AdminRoute>
            } />
            <Route path="/admin/create-listing" element={
              <AdminRoute><CreateListingPage /></AdminRoute>
            } />
          </Routes>
        </div>

        {/* ── Footer ── */}
        <Footer />

      </div>
    </AuthContext.Provider>
  );
}

export default App;