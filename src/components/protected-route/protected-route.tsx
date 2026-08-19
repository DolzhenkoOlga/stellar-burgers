import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { Preloader } from '@ui';

type ProtectedRouteProps = {
  children: React.ReactNode;
  onlyUnAuth?: boolean;
};

export const ProtectedRoute = ({
  children,
  onlyUnAuth = false
}: ProtectedRouteProps): React.ReactNode => {
  const { isAuthChecked, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthChecked) {
    return <Preloader />;
  }

  const isAuthenticated = !!user;

  if (onlyUnAuth && isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  }

  if (!onlyUnAuth && !isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
