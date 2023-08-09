import { useRouter } from 'next/router';
import { IProduct } from '../../typings';
import Header from '../components/Header';
import ProductFeed from '../components/ProductFeed';
import React from 'react';
import { useProductContext } from '../components/context/ProductContext';

const SearchPage = () => {
  const router = useRouter();
  const q = router.query.q as string;
  const { products, loading, error } = useProductContext();

  // Filter the list of products based on the search query
  const filteredProducts = q
    ? products.filter(product =>
        product.title.toLowerCase().includes(q.toLowerCase())
      )
    : [];

  return (
    <div className="bg-gray-100">
      <Header />
      <main className="max-w-screen-2xl mx-auto">
        <h1 className="text-3xl font-bold mt-4 mb-6 text-center">Search results for "{q}"</h1>
        {/* Pass the filtered list of products to the ProductFeed component */}
        <ProductFeed products={filteredProducts} />
      </main>
    </div>
  );
};

export default SearchPage;