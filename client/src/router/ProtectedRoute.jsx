import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import PageLoader from '../components/ui/PageLoader';

/**
 * Guards routes that require authentication.
 * While the session is being restored we show a loader to avoid a redirect flash.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
