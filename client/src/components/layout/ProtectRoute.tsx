import { ReactNode } from 'react';
import { useAppSelector } from '../../redux/hooks';
import { getCurrentUser } from '../../redux/services/authSlice';
import { Navigate } from 'react-router-dom';

const ProtectRoute = ({ children }: { children: ReactNode }) => {
  const user = useAppSelector(getCurrentUser);

  return children;
};

export default ProtectRoute;
