'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock } from 'lucide-react';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema } from '@/lib/validations/auth';
import { getErrorMessage } from '@/lib/apiResponse';
import { getHomeForRole, isAdmin, isCustomer } from '@/lib/auth';
import { APP_ROUTES } from '@/constants/routes';
import notify from '@/lib/toast';

function resolvePostLoginPath(role, redirect) {
  if (!redirect) return getHomeForRole(role);

  if (isAdmin(role) && redirect.startsWith(APP_ROUTES.ADMIN.ROOT)) {
    return redirect;
  }

  if (isCustomer(role) && redirect.startsWith(APP_ROUTES.CUSTOMER.ROOT)) {
    return redirect;
  }

  return getHomeForRole(role);
}

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  async function onSubmit(values) {
    setFormError('');

    try {
      const result = await login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      if (!result.success) {
        setFormError(result.message || 'Unable to sign in');
        notify.error(result.message || 'Unable to sign in');
        return;
      }

      notify.success(result.message || 'Login successful');
      const role = result.data?.user?.role;
      const destination = resolvePostLoginPath(role, searchParams.get('redirect'));
      router.replace(destination);
    } catch (error) {
      const message = getErrorMessage(error, 'Invalid email or password');
      setFormError(message);
      notify.error(message);
    }
  }

  return (
    <div className="surface-card p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-primary">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-muted">
          Sign in to continue to your workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          leftIcon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          leftIcon={Lock}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between gap-3">
          <Checkbox label="Remember Me" {...register('rememberMe')} />
          <button
            type="button"
            onClick={() => notify.info('Password recovery will be available soon')}
            className="text-sm font-medium text-accent transition hover:text-[#1d4ed8]"
          >
            Forgot Password?
          </button>
        </div>

        {formError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-danger">
            {formError}
          </div>
        ) : null}

        <Button type="submit" fullWidth loading={isSubmitting} size="lg">
          {isSubmitting ? 'Signing in…' : 'Login'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link
          href={APP_ROUTES.REGISTER}
          className="font-semibold text-accent transition hover:text-[#1d4ed8]"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
