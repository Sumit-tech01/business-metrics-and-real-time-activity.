import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, error, submitting, clearError } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (event) => {
    clearError();
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await register(form);
      navigate('/');
    } catch {
      // handled in hook
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8">
      <div className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-teal-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/95 p-6 shadow-2xl backdrop-blur dark:bg-slate-900/90">
        <div className="mb-6">
          <p className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Create account</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Set up your ERP workspace in minutes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Alex Carter"
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@company.com"
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            minLength={6}
            required
          />

          {error ? <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-600">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create Account'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
