import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useMutation } from '@tanstack/react-query';
import authApi from '../api/auth.api';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../components/ui/Toast';
import { registerSchema } from '../utils/validators';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import GoogleButton from '../components/auth/GoogleButton';

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.07 * i } }),
};

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const mutation = useMutation({
    mutationFn: ({ name, email, password }) => authApi.register({ name, email, password }),
    onSuccess: (res) => {
      login(res.data.accessToken, res.data.user);
      success('Account created — welcome to RecipeRight!');
      navigate('/', { replace: true });
    },
    onError: (err) => {
      const data = err.response?.data;
      const fieldMsg = data?.errors?.[0]?.message;
      error(fieldMsg || data?.message || 'Registration failed');
    },
  });

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-12">
      <Helmet>
        <title>Sign up · RecipeRight</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="mb-8 text-center">
            <h1 className="font-heading text-3xl">Create your account</h1>
            <p className="mt-2 text-sm text-text-secondary">Join the RecipeRight community</p>
          </div>

          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            {[
              { name: 'name', label: 'Full name', type: 'text', autoComplete: 'name' },
              { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
              { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
              { name: 'confirmPassword', label: 'Confirm password', type: 'password', autoComplete: 'new-password' },
            ].map((f, i) => (
              <motion.div key={f.name} custom={i + 1} variants={fieldVariants} initial="hidden" animate="show">
                <Input
                  label={f.label}
                  type={f.type}
                  autoComplete={f.autoComplete}
                  error={errors[f.name]?.message}
                  {...register(f.name)}
                />
              </motion.div>
            ))}
            <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="show">
              <Button type="submit" className="w-full" loading={mutation.isPending}>
                Create account
              </Button>
            </motion.div>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-text-tertiary">
            <span className="h-px flex-1 bg-[var(--border)]" /> or <span className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <GoogleButton label="Sign up with Google" />

          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-accent hover:underline">
              Log in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
