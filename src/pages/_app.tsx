import { AppProps } from 'next/app';
import { ApifyProvider } from '@/contexts/ApifyContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApifyProvider>
      <Component {...pageProps} />
    </ApifyProvider>
  );
}

export default MyApp;
