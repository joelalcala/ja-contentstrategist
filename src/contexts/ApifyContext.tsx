"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import ApifyApi from '@/lib/api/apify/apifyApi';

const ApifyContext = createContext<ApifyApi | null>(null);

export const ApifyProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [apifyApi, setApifyApi] = useState<ApifyApi | null>(null);

  useEffect(() => {
    const api = new ApifyApi();
    setApifyApi(api);
  }, []);

  return <ApifyContext.Provider value={apifyApi}>{children}</ApifyContext.Provider>;
};

export const useApify = () => {
  const context = useContext(ApifyContext);
  if (context === undefined) {
    throw new Error('useApify must be used within an ApifyProvider');
  }
  return context;
};
