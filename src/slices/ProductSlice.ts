import { IProduct } from "../../typings";
import { AnyAction } from 'redux';

// Define action types
const SET_PRODUCTS = 'SET_PRODUCTS';
const SET_LOADING = 'SET_LOADING';
const SET_ERROR = 'SET_ERROR';
const SET_LAST_UPDATED = 'SET_LAST_UPDATED';

// Define action creators
export const setProducts = (products: IProduct[]) => ({ type: SET_PRODUCTS, products });
export const setLoading = (loading: boolean) => ({ type: SET_LOADING, loading });
export const setError = (error: string | null) => ({ type: SET_ERROR, error });
export const setLastUpdated = (lastUpdated: number) => ({ type: SET_LAST_UPDATED, lastUpdated });

// Define initial state
const initialState = {
  products: [],
  loading: true,
  error: null,
  lastUpdated: null,
};

// Define action and state types
type ProductAction =
  | { type: typeof SET_PRODUCTS; products: IProduct[] }
  | { type: typeof SET_LOADING; loading: boolean }
  | { type: typeof SET_ERROR; error: string | null }
  | { type: typeof SET_LAST_UPDATED; lastUpdated: number };

export type ProductState = {
  products: IProduct[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
};

// Define reducer function
export function productReducer(state: ProductState = initialState, action: AnyAction): ProductState {
    switch (action.type) {
      case SET_PRODUCTS:
        return { ...state, products: action.products };
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