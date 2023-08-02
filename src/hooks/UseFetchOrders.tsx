import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import db from '../../firebase';
import { collection, doc, getDocs, orderBy, query } from 'firebase/firestore';
import { setOrders, setLoading, setError } from '../slices/OrderSlice';
import { IOrder, ISession } from '../../typings';
import moment from 'moment';

export const useFetchOrders = (session: ISession | null) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!session) return;

        // Fetch orders directly from Firebase without using Stripe
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
      } catch (err) {
        console.error(err);
        dispatch(setError('Error fetching orders.'));
        dispatch(setLoading(false));
      }
    };

    fetchOrders();
  }, [session]);
};