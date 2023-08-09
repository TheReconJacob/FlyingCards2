import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { IProduct } from '../../typings';
import Banner from '../components/Banner';
import Header from '../components/Header';
import ProductFeed from '../components/ProductFeed';
import { useProductContext } from '../components/context/ProductContext';
import { getSession } from 'next-auth/react';

type Props = {
  products: IProduct[];
};

const Home = () => {
  const { products, loading, error } = useProductContext();

  return (
    <div className="bg-gray-100">
      <Head>
        <title>Flying Cards</title>
      </Head>
      <Header />
      <main className="max-w-screen-2xl mx-auto">
        <Banner />
        <h1 className="text-3xl font-bold mt-4 mb-6 text-center">Flying Cards</h1>
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