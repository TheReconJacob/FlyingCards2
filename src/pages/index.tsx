import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { IProduct } from '../../typings';
import Banner from '../components/Banner';
import Header from '../components/Header';
import ProductFeed from '../components/ProductFeed';
import { useProductContext } from '../components/context/ProductContext'; // Import the useProductContext
import { getSession } from 'next-auth/react';
import { useFetchProducts } from '../hooks/UseFetchProducts'; // Import the useFetchProducts custom hook

type Props = {
  products: IProduct[];
};

const Home = () => {
  // Call the custom hook to set up the real-time listener and fetch data from Firebase
  useFetchProducts();

  // Use the product context to get the products and loading state
  const { products, loading, error } = useProductContext();

  return (
    <div className="bg-gray-100">
      <Head>
        <title>Flying Cards</title>
        <link rel="icon" href="/fcicon.ico" />
      </Head>
      <Header />
      <main className="max-w-screen-2xl mx-auto">
        <Banner />
        {/* Use the context products */}
        <ProductFeed products={products} />
      </main>
    </div>
  );
};

export default Home;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  // Get user logged in credentials
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  };
};