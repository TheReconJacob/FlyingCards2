import { useRouter } from 'next/router';
import { IProduct } from '../../../typings';
import Header from '../../components/Header';
import ProductFeed from '../../components/ProductFeed';
import React from 'react';
import { useProductContext } from '../../components/context/ProductContext';
const CategoryPage = () => {
  const router = useRouter();
  const { category: categorySegments } = router.query;
  const { products, loading, error } = useProductContext();

  // Get the category, subcategory, and subsubcategory values from the URL path
  const [category, subcategory, subsubcategory] = categorySegments || [];

  // Filter the list of products based on the category, subcategory, and subsubcategory
  const filteredProducts = products.filter(product => {
    if (subsubcategory) {
      return product.subsubcategory === subsubcategory;
    } else if (subcategory) {
      return product.subcategory === subcategory;
    } else {
      return product.category === category;
    }
  });

  return (
    <div className="bg-gray-100">
      <Header />
      <main className="max-w-screen-2xl mx-auto">
        <h1 className="text-3xl font-bold mt-4 mb-6 text-center">{subsubcategory || subcategory || category}</h1>
        {/* Pass the filtered list of products to the ProductFeed component */}
        <ProductFeed products={filteredProducts} />
      </main>
    </div>
  );
};

export default CategoryPage;