import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import Login from './Forms/Login';
import SignUp from './Forms/SignUp';
import ForgotPassword from './Forms/ForgotPassword';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import PostAlert from './pages/PostAlert';
import { handleGoogleCallback } from './services/api';
import ProtectedRoute from './components/ProtectedRoute';
import Feed from './pages/Feed';
const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      handleGoogleCallback(token)
        .then(() => {
          navigate('/feed');
        })
        .catch((error) => {
          console.error('Google callback error:', error);
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [navigate, location]);

  return null;
};

const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="*" element={<NotFound />} />
          <Route path="/post-alert" element={<PostAlert />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/feed" element={<Feed />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
