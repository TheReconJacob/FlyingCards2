import { GetServerSidePropsContext } from "next";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import { IProduct, ISession } from "../../typings";
import Banner from "../components/Banner";
import Header from "../components/Header";
import ProductFeed from "../components/ProductFeed";
import admin from '../../firebaseAdmin';

type Props = {
  products: IProduct[];
};

const Home = ({ products }: Props) => {
  const { data: session } = useSession();

  return (
    <div className="bg-gray-100">
      <Head>
        <title>Flying Cards</title>
        <link rel="icon" href="/fcicon.ico" />
      </Head>
      {/* Header */}
      <Header />
      <main className="max-w-screen-2xl mx-auto">
        {/* Banner */}
        <Banner />
        {/* ProductFeed */}
        <ProductFeed products={products} />
      </main>
    </div>
  );
};

export default Home;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const db = admin.firestore();
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();
  const products = snapshot.docs.map(doc => doc.data());
  
  // Get user logged in credentials
  const session: ISession | null = await getSession(context);
  if (!session) {
    return {
      props: {
        products,
      },
    };
  }


  return {
    props: {
      products,
      session,
    },
  };
};
