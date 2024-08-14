// components/ClientSessionProvider.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface ClientSessionProviderProps {
  children: ReactNode;
}

const ClientSessionProvider = ({ children }: ClientSessionProviderProps) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default ClientSessionProvider;
