import { PositionBook } from "@/types";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState: PositionBook[] = [];

const positionsSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {
    initPositions: (state, action) => action.payload,
    updatePositonltp: (state, action) => {
      let p = state.find((pos) => pos.token === action.payload.token);
      if (p) {
        p.lp = action.payload.lp;
      }
    },
  },
});

export const { initPositions, updatePositonltp } = positionsSlice.actions;

export default positionsSlice.reducer;
