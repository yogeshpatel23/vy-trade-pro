import { Script } from "@/types";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState: Script[][] = [[], [], []];

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {
    addToWatchlist: (
      state,
      action: PayloadAction<{ script: Script; tabId: string }>
    ) => {
      switch (action.payload.tabId) {
        case "1":
          state[0].push(action.payload.script);
          break;
        case "2":
          state[1].push(action.payload.script);
          break;
        case "3":
          state[2].push(action.payload.script);
          break;
        default:
          break;
      }
    },
    updateScript: (
      state,
      action: PayloadAction<{ token: string; lp: string }>
    ) => {
      state.forEach((wl) => {
        wl.forEach((script) => {
          if (script.token === action.payload.token) {
            script.ltp = action.payload.lp;
          }
        });
      });
    },
    removeScript: (
      state,
      action: PayloadAction<{ token: string; tabid: string }>
    ) => {
      switch (action.payload.tabid) {
        case "1":
          state[0] = state[0].filter((sy) => sy.token !== action.payload.token);
          break;
        case "2":
          state[1] = state[1].filter((sy) => sy.token !== action.payload.token);
          break;
        case "3":
          state[2] = state[2].filter((sy) => sy.token !== action.payload.token);
          break;
        default:
          break;
      }
    },
  },
});

export const { addToWatchlist, updateScript, removeScript } =
  watchlistSlice.actions;

export default watchlistSlice.reducer;
