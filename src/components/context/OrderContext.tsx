import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';

// Define custom hook to access orders data from the Redux store
export const useOrderContext = () => {
  const orders = useSelector((state: RootState) => state.order.orders);
  const loading = useSelector((state: RootState) => state.order.loading);
  const error = useSelector((state: RootState) => state.order.error);

  return { orders, loading, error };
};