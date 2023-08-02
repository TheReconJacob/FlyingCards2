import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import db from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { setProducts, setLoading, setError } from '../slices/ProductSlice';
import { IProduct } from '../../typings';

export const useFetchProducts = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, 'products');
        onSnapshot(productsRef, (snapshot) => {
          const updatedProducts: IProduct[] = [];
          snapshot.forEach((doc) => {
            updatedProducts.push(doc.data() as IProduct);
          });

          dispatch(setProducts(updatedProducts));
          dispatch(setLoading(false));
        });
      } catch (err) {
        dispatch(setError('Error fetching products.'));
        dispatch(setLoading(false));
      }
    };

    fetchProducts();
  }, []);
};