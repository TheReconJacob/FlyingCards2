import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { IProduct, ISession } from "../../../typings";
import Banner from "../../components/Banner";
import Header from "../../components/Header";
import ProductFeed from "../../components/ProductFeed";
import admin from '../../../firebaseAdmin';
import React from 'react';

type Props = {
  products: IProduct[];
};

const CategoryPage = ({ products }: Props) => {
  const router = useRouter();
  const { category } = router.query;

  return (
    <div className="bg-gray-100">
      <Header />
      <main className="max-w-screen-2xl mx-auto">
        <Banner />
        <h1 className="text-3xl font-bold mt-4 mb-6">{category}</h1>
        <ProductFeed products={products} />
      </main>
    </div>
  );
};

export default CategoryPage;

export const getServerSideProps = async (
    context: GetServerSidePropsContext
) => {
        const category = context.params?.category as string;

        const db = admin.firestore();
        const productsRef = db.collection('products');
        const snapshot = await productsRef.where('category', '==', category).get();
        const products = snapshot.docs.map(doc => doc.data());
        return {
        props: {
            products,
        },
    };
};  