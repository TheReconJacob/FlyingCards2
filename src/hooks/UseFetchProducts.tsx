import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import db from '../../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import {
  ProductState,
  setProducts,
  setLoading,
  setError,
  setLastUpdated,
} from '../slices/ProductSlice';
import { IProduct } from '../../typings';

export const useFetchProducts = () => {
  const dispatch = useDispatch();

  type RootState = {
    product: ProductState;
  };

  const lastUpdated = useSelector((state: RootState) => state.product.lastUpdated);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get the last updated timestamp from Firebase
        const lastUpdatedRef = collection(db, 'lastUpdated');
        const lastUpdatedQuery = query(lastUpdatedRef, where('type', '==', 'products'));
        const lastUpdatedSnapshot = await getDocs(lastUpdatedQuery);
        let lastUpdatedData = lastUpdatedSnapshot.docs[0]?.data();

        // Check if the last updated timestamp exists
        if (!lastUpdatedData) {
          // Timestamp does not exist, create it
          await addDoc(lastUpdatedRef, { type: 'products', timestamp: serverTimestamp() });
          // Re-fetch the last updated timestamp
          const newLastUpdatedSnapshot = await getDocs(lastUpdatedQuery);
          lastUpdatedData = newLastUpdatedSnapshot.docs[0]?.data();
        }

        // Check if the data has been updated since it was last persisted
        if (
          !lastUpdated ||
          !lastUpdatedData ||
          lastUpdatedData.timestamp.toMillis() !== lastUpdated
        ) {
          // Data has been updated, fetch it again from Firebase
          const productsRef = collection(db, 'products');
          onSnapshot(productsRef, (snapshot) => {
            const updatedProducts: IProduct[] = [];
            snapshot.forEach((doc) => {
              updatedProducts.push(doc.data() as IProduct);
            });

            dispatch(setProducts(updatedProducts));
            dispatch(setLoading(false));

            // Update the last updated timestamp in the Redux store
            if (lastUpdatedData) {
              dispatch(
                setLastUpdated(lastUpdatedData.timestamp.toMillis())
              );
            }
          });
        }
      } catch (err) {
        dispatch(setError('Error fetching products.'));
        dispatch(setLoading(false));
      }
    };

    fetchProducts();
  }, []);
};