import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useMutation } from '@tanstack/react-query';
import authApi from '../api/auth.api';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../components/ui/Toast';
import { loginSchema } from '../utils/validators';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import GoogleButton from '../components/auth/GoogleButton';

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i } }),
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { success, error } = useToast();
  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  // Handle Google OAuth redirect: token arrives in the URL fragment.
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token=')) {
      const token = new URLSearchParams(hash.slice(1)).get('access_token');
      if (token) {
        login(token, null);
        authApi
          .getMe()
          .then((res) => {
            login(token, res.data.user);
            success(`Welcome, ${res.data.user.name.split(' ')[0]}!`);
            navigate('/', { replace: true });
          })
          .catch(() => error('Google sign-in failed'));
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mutation = useMutation({
    mutationFn: (data) => authApi.login(data),
    onSuccess: (res) => {
      const { accessToken, user: userData } = res?.data || {};
      if (!accessToken || !userData) {
        error('Login failed — invalid server response');
        return;
      }
      login(accessToken, userData);
      success(`Welcome back, ${userData.name.split(' ')[0]}!`);
      navigate(from, { replace: true });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      error(msg);
    },
  });

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-12">
      <Helmet>
        <title>Log in · RecipeRight</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="mb-8 text-center">
            <h1 className="font-heading text-3xl">Welcome back</h1>
            <p className="mt-2 text-sm text-text-secondary">Log in to your RecipeRight account</p>
            {from === '/create' && (
              <p className="mt-3 rounded-xl bg-accent-soft px-4 py-2 text-sm text-accent">
                Log in to create and share your recipe.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="show">
              <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
            </motion.div>
            <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="show">
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />
            </motion.div>
            <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="show">
              <Button type="submit" className="w-full" loading={mutation.isPending}>
                Log in
              </Button>
            </motion.div>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-text-tertiary">
            <span className="h-px flex-1 bg-[var(--border)]" /> or <span className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <GoogleButton />

          <p className="mt-6 text-center text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-accent hover:underline">
              Sign up
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
