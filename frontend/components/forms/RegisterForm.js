'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Phone } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema } from '@/lib/validations/auth';
import { getErrorMessage } from '@/lib/apiResponse';
import { APP_ROUTES } from '@/constants/routes';
import notify from '@/lib/toast';

export default function RegisterForm() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values) {
    setFormError('');

    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        ...(values.phone ? { phone: values.phone } : {}),
      };

      const result = await registerUser(payload);

      if (!result.success) {
        setFormError(result.message || 'Unable to register');
        notify.error(result.message || 'Unable to register');
        return;
      }

      notify.success(result.message || 'Account created successfully');
      router.replace(APP_ROUTES.LOGIN);
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to create account');
      setFormError(message);
      notify.error(message);
    }
  }

  return (
    <div className="surface-card p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-primary">
          Create account
        </h2>
        <p className="mt-2 text-sm text-muted">
          Register as a customer to start managing rentals.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First Name"
            autoComplete="given-name"
            placeholder="John"
            leftIcon={User}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            autoComplete="family-name"
            placeholder="Doe"
            leftIcon={User}
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

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
          label="Phone"
          type="tel"
          autoComplete="tel"
          placeholder="Optional"
          leftIcon={Phone}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          leftIcon={Lock}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          leftIcon={Lock}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {formError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-danger">
            {formError}
          </div>
        ) : null}

        <Button type="submit" fullWidth loading={isSubmitting} size="lg">
          {isSubmitting ? 'Creating account…' : 'Register'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link
          href={APP_ROUTES.LOGIN}
          className="font-semibold text-accent transition hover:text-[#1d4ed8]"
        >
          Login
        </Link>
      </p>
    </div>
  );
}
