import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../app/store';
import '../styles/globals.css';
import Layout from '../components/Layout';
import Head from 'next/head';
import Ad from '../components/Ads';
import Footer from '../components/Footer';
import Script from './Script';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Layout>
            <Head>
              <link rel="icon" href="/fcicon.ico" />
            </Head>
            <Script src="https://mutcheng.net/400/6205792" />
            <Ad />
            <Component {...pageProps} />
            <Footer />
          </Layout>
        </PersistGate>
      </Provider>
    </SessionProvider>
  );
}

export default MyApp;