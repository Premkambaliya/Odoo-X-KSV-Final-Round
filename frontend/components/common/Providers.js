'use client';

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          duration: 4000,
          className: 'text-sm',
        }}
      />
    </AuthProvider>
  );
}
