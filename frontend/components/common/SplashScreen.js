'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { getHomeForRole } from '@/lib/auth';
import { APP_ROUTES } from '@/constants/routes';
import Logo from '@/components/ui/Logo';

const SPLASH_MS = 2600;

export default function SplashScreen() {
  const router = useRouter();
  const { role, loading, isAuthenticated } = useAuth();
  const [exiting, setExiting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready || loading) return;

    setExiting(true);
    const destination = isAuthenticated
      ? getHomeForRole(role)
      : APP_ROUTES.LOGIN;

    const redirectTimer = setTimeout(() => {
      router.replace(destination);
    }, 450);

    return () => clearTimeout(redirectTimer);
  }, [ready, loading, isAuthenticated, role, router]);

  return (
    <AnimatePresence mode="wait">
      {!exiting ? (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.22), transparent 55%), linear-gradient(160deg, #0B1220 0%, #111827 45%, #1F2937 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center px-6 text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Logo size="lg" inverted showText={false} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="mt-8 max-w-lg text-3xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              Car Rental Management System
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mt-3 text-sm text-slate-400"
            >
              Enterprise fleet operations platform
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scaleX: 0.6 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="mt-10 w-48"
            >
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent via-blue-400 to-accent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{ width: '55%' }}
                />
              </div>
              <p className="mt-3 text-xs font-medium tracking-widest text-slate-500 uppercase">
                Preparing workspace
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
