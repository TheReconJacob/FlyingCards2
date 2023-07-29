import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IProduct } from "../../typings";
import { RootState } from "../app/store";

export interface BasketState {
  items: IProduct[];
}

// Load initial state from localStorage
const initialState: BasketState = {
  items: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("basket") || "[]") : [],
};

export const basketSlice = createSlice({
  name: "basket",
  initialState,
  reducers: {
    addToBasket: (state, action: PayloadAction<IProduct>) => {
      state.items = [...state.items, action.payload];
      // Save state to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem("basket", JSON.stringify(state.items));
      }
    },
    removeFromBasket: (state, action) => {
      const index = state.items.findIndex(
        (basketItem) => basketItem.id === action.payload.id
      );
      let newBasket = [...state.items];

      if (index >= 0) {
        // the item exists in the basket, remove it
        newBasket.splice(index, 1);
      } else {
        alert(
          `Can't remove this product as its not in the basket`
        );
      }

      state.items = newBasket;
      // Save state to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem("basket", JSON.stringify(state.items));
      }
    },
    emptyBasket: (state) => {
      state.items = [];
      // Save state to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem("basket", JSON.stringify(state.items));
      }
    },
  },
});

export const { addToBasket, removeFromBasket, emptyBasket } = basketSlice.actions;

// Selectors pull the information from the Global store slice
export const selectItems = (state: RootState) => state.basket.items;
export const selectTotal = (state: RootState) =>
  state.basket.items.reduce((total, item) => total + item.price, 0);

export default basketSlice.reducer;