import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { IProduct, ISession } from "../../typings";
import Header from "../components/Header";
import ProductFeed from "../components/ProductFeed";
import admin from '../../firebaseAdmin';
import React from 'react';

type Props = {
  products: IProduct[];
};

const SearchPage = ({ products }: Props) => {
  const router = useRouter();
  const { q } = router.query;

  return (
    <div className="bg-gray-100">
      <Header />
      <main className="max-w-screen-2xl mx-auto">
        <h1 className="text-3xl font-bold mt-4 mb-6">Search results for "{q}"</h1>
        <ProductFeed products={products} />
      </main>
    </div>
  );
};

export default SearchPage;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const q = (context.query.q as string).toLowerCase();
  
  const db = admin.firestore();
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();
  const products = snapshot.docs.map(doc => doc.data()).filter(product => product.title.toLowerCase().includes(q));

  return {
    props: {
      products,
    },
  };
};