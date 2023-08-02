import { useRouter } from 'next/router';
import { IProduct } from '../../typings';
import Header from '../components/Header';
import ProductFeed from '../components/ProductFeed';
import React from 'react';
import { useProductContext } from '../components/context/ProductContext'; // Import the useProductContext
import { useFetchProducts } from '../hooks/UseFetchProducts'; // Import the useFetchProducts custom hook

const SearchPage = () => {
  const router = useRouter();
  const { q } = router.query;

  // Call the custom hook to set up the real-time listener and fetch data from Firebase
  useFetchProducts();

  // Use the product context to get the products and loading state
  const { products, loading, error } = useProductContext();

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