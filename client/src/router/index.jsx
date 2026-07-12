import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import PageLoader from '../components/ui/PageLoader';
import ErrorBoundary from '../components/ErrorBoundary';

const Home = lazy(() => import('../pages/Home'));
const Explore = lazy(() => import('../pages/Explore'));
const RecipeDetail = lazy(() => import('../pages/RecipeDetail'));
const CreateRecipe = lazy(() => import('../pages/CreateRecipe'));
const EditRecipe = lazy(() => import('../pages/EditRecipe'));
const Profile = lazy(() => import('../pages/Profile'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const NotFound = lazy(() => import('../pages/NotFound'));

function page(Component) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: page(Home) },
      { path: 'explore', element: page(Explore) },
      { path: 'recipes/:id', element: page(RecipeDetail) },
      { path: 'profile/:userId', element: page(Profile) },
      { path: 'login', element: page(Login) },
      { path: 'register', element: page(Register) },
      {
        path: 'create',
        element: <ProtectedRoute>{page(CreateRecipe)}</ProtectedRoute>,
      },
      {
        path: 'recipes/:id/edit',
        element: <ProtectedRoute>{page(EditRecipe)}</ProtectedRoute>,
      },
      {
        path: 'me',
        element: <ProtectedRoute>{page(Profile)}</ProtectedRoute>,
      },
      { path: '*', element: page(NotFound) },
    ],
  },
]);
