import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import db from '../../firebase';
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  where,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  OrderState,
  setOrders,
  setLoading,
  setError,
  setLastUpdated,
} from '../slices/OrderSlice';
import { IOrder, ISession } from '../../typings';
import moment from 'moment';

export const useFetchOrders = (session: ISession | null) => {
  const dispatch = useDispatch();

  type RootState = {
    order: OrderState;
  };

  const lastUpdated = useSelector((state: RootState) => state.order.lastUpdated);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!session) return;

        // Get the last updated timestamp from Firebase
        const lastUpdatedRef = collection(db, 'lastUpdated');
        const lastUpdatedQuery = query(
          lastUpdatedRef,
          where('type', '==', 'orders'),
          where('email', '==', session.user.email)
        );
        const lastUpdatedSnapshot = await getDocs(lastUpdatedQuery);
        let lastUpdatedData = lastUpdatedSnapshot.docs[0]?.data();

        // Check if the last updated timestamp exists
        if (!lastUpdatedData) {
          // Timestamp does not exist, create it
          await addDoc(lastUpdatedRef, { type: 'orders', email: session.user.email, timestamp: serverTimestamp() });
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
          const ordersQuery = query(
            collection(doc(collection(db, 'users'), session.user.email), 'orders'),
            orderBy('timestamp', 'desc')
          );
          const ordersSnapshot = await getDocs(ordersQuery);

          // Process the orders from Firebase
          const orders = ordersSnapshot.docs.map((orderSnapshot) => {
            const orderData = orderSnapshot.data();
            return {
              id: orderData.id,
              title: orderData.title,
              amount: orderData.amount,
              amount_shipping: orderData.amount_shipping,
              images: orderData.images,
              timestamp: moment(orderData.timestamp.toDate()).unix(),
            };
          });

          dispatch(setOrders(orders));
          dispatch(setLoading(false));

          // Update the last updated timestamp in the Redux store
          if (lastUpdatedData) {
            dispatch(
              setLastUpdated(lastUpdatedData.timestamp.toMillis())
            );
          }
        }
      } catch (err) {
        console.error(err);
        dispatch(setError('Error fetching orders.'));
        dispatch(setLoading(false));
      }
    };

    fetchOrders();
  }, [session]);
};