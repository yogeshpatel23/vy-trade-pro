import { configureStore } from "@reduxjs/toolkit";
import WatchlistReducer from "@/store/watchlistSlice";
import OrderlistReducer from "@/store/orderlistSlice";
import PositionsReducer from "@/store/positionsSlice";
import IndexWatchReducer from "@/store/indexWatchSlice";

export const store = configureStore({
  reducer: {
    watchlist: WatchlistReducer,
    orderlist: OrderlistReducer,
    positions: PositionsReducer,
    indexwatch: IndexWatchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
