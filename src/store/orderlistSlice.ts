import { OrderBook } from "@/types";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState: OrderBook[] = [];

const orderlistSlice = createSlice({
  name: "orderlist",
  initialState,
  reducers: {
    initOrderlist: (state, action: PayloadAction<OrderBook[]>) => {
      state = action.payload;
      return state;
    },
    updateOrderltp: (
      state,
      action: PayloadAction<{ token: string; lp: string }>
    ) => {
      state.map((order) => {
        if (order.token === action.payload.token) {
          order.ltp = action.payload.lp;
        }
        return order;
      });
    },
    removeOrdrer: (state, action) =>
      state.filter((order) => order.norenordno !== action.payload),
  },
});

export const { initOrderlist, updateOrderltp, removeOrdrer } =
  orderlistSlice.actions;

export default orderlistSlice.reducer;
