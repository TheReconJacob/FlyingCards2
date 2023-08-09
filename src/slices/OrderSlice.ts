import { IOrder } from "../../typings";
import { AnyAction } from 'redux';

// Define action types
const SET_ORDERS = 'SET_ORDERS';
const SET_LOADING = 'SET_LOADING';
const SET_ERROR = 'SET_ERROR';
const SET_LAST_UPDATED = 'SET_LAST_UPDATED';

// Define action creators
export const setOrders = (orders: IOrder[]) => ({ type: SET_ORDERS, orders });
export const setLoading = (loading: boolean) => ({ type: SET_LOADING, loading });
export const setError = (error: string | null) => ({ type: SET_ERROR, error });
export const setLastUpdated = (lastUpdated: number) => ({ type: SET_LAST_UPDATED, lastUpdated });

// Define initial state
const initialState = {
  orders: [],
  loading: true,
  error: null,
  lastUpdated: null,
};

// Define action and state types
type OrderAction =
  | { type: typeof SET_ORDERS; orders: IOrder[] }
  | { type: typeof SET_LOADING; loading: boolean }
  | { type: typeof SET_ERROR; error: string | null }
  | { type: typeof SET_LAST_UPDATED; lastUpdated: number };

export type OrderState = {
  orders: IOrder[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
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
      case SET_LAST_UPDATED:
        return { ...state, lastUpdated: action.lastUpdated };
      default:
        return state;
    }
}