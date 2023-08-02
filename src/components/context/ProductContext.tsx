import { useContext } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';

// Define custom hook to access products data from the Redux store
export const useProductContext = () => {
  const products = useSelector((state: RootState) => state.product.products);
  const loading = useSelector((state: RootState) => state.product.loading);
  const error = useSelector((state: RootState) => state.product.error);

  return { products, loading, error };
};