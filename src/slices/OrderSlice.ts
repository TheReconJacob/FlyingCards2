import { IOrder } from "../../typings";
import { AnyAction } from 'redux';

// Define action types
const SET_ORDERS = 'SET_ORDERS';
const SET_LOADING = 'SET_LOADING';
const SET_ERROR = 'SET_ERROR';

// Define action creators
export const setOrders = (orders: IOrder[]) => ({ type: SET_ORDERS, orders });
export const setLoading = (loading: boolean) => ({ type: SET_LOADING, loading });
export const setError = (error: string | null) => ({ type: SET_ERROR, error });

// Define initial state
const initialState = {
  orders: [],
  loading: true,
  error: null,
};

// Define action and state types
type OrderAction =
  | { type: typeof SET_ORDERS; orders: IOrder[] }
  | { type: typeof SET_LOADING; loading: boolean }
  | { type: typeof SET_ERROR; error: string | null };

export type OrderState = {
  orders: IOrder[];
  loading: boolean;
  error: string | null;
};

// Define reducer function
export function orderReducer(state: OrderState = initialState, action: AnyAction): OrderState {
    switch (action.type) {
      case SET_ORDERS:
        return { ...state, orders: action.orders };
      case SET_LOADING:
        return { ...state, loading: action.loading };
      case SET_ERROR:
        return { ...state, error: action.error };
      default:
        return state;
    }
}