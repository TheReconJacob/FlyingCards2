import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

// Define an interface for the shape of the categories object
interface Categories {
  [category: string]: {
    subcategories: {
      [subcategory: string]: {
        subsubcategories: {
          [subsubcategory: string]: boolean;
        };
      };
    };
  };
}

export const useCategories = () => {
  const products = useSelector((state: RootState) => state.product.products);

  // Create a nested object that includes the categories, subcategories, and sub-subcategories
  const categories = products.reduce<Categories>((acc, product) => {
    // Check if the category already exists in the accumulator object
    if (!acc[product.category]) {
      acc[product.category] = { subcategories: {} };
    }

    // Check if the product has a subcategory
    if (product.subcategory) {
      // Check if the subcategory already exists in the accumulator object
      if (!acc[product.category].subcategories[product.subcategory]) {
        acc[product.category].subcategories[product.subcategory] = { subsubcategories: {} };
      }

      // Check if the product has a sub-subcategory
      if (product.subsubcategory) {
        // Add the sub-subcategory to the accumulator object
        acc[product.category].subcategories[product.subcategory].subsubcategories[product.subsubcategory] = true;
      }
    }

    return acc;
  }, {});

  // Convert the nested object into an array of objects with the desired shape
  const result = Object.entries(categories).map(([categoryName, categoryData]) => ({
    name: categoryName,
    subcategories: Object.entries(categoryData.subcategories).map(([subcategoryName, subcategoryData]) => ({
      name: subcategoryName,
      subsubcategories: Object.keys(subcategoryData.subsubcategories),
    })),
  }));

  return result;
};