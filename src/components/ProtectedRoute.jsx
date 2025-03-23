import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('token') !== null;
  console.log(isAuthenticated);
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname, message: 'You need to be logged in to access this page' }} 
        replace 
      />
    );
  }

  return <Outlet />; // ✅ This renders the protected page inside the route
};

export default ProtectedRoute;
