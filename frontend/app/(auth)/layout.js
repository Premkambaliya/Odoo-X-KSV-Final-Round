'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from '@/components/ui/Logo';
import { APP_ROUTES } from '@/constants/routes';

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div
        className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 10% 20%, rgba(37,99,235,0.35), transparent 50%), linear-gradient(160deg, #0B1220 0%, #111827 50%, #1F2937 100%)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <Logo inverted />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-md"
        >
          <p className="text-sm font-medium tracking-[0.2em] text-blue-300/80 uppercase">
            Enterprise Platform
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white">
            Car Rental Management System
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Operate your fleet with the precision of a premium automotive brand —
            secure access, role-based control, and a workspace built for scale.
          </p>
        </motion.div>

        <p className="relative z-10 text-xs text-slate-500">
          Secure JWT authentication · Role-based access
        </p>
      </div>

      <div className="flex min-h-screen flex-col justify-center bg-background px-4 py-10 sm:px-8">
        <div className="mx-auto mb-8 w-full max-w-md lg:hidden">
          <Link href={APP_ROUTES.HOME}>
            <Logo size="sm" />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
