import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: {
  cname: string;
  token: string;
  ltp: string;
  pc: string;
}[] = [
  { cname: "Nifty 50", token: "26000", ltp: "0", pc: "0.00" },
  { cname: "BankNifty", token: "26009", ltp: "0", pc: "0.00" },
  { cname: "finNifty", token: "26037", ltp: "0", pc: "0.00" },
];

const indexWatchSlice = createSlice({
  name: "indexwatch",
  initialState,
  reducers: {
    updateLtp: (
      state,
      action: PayloadAction<{
        token: string;
        lp: string;
        pc: string | undefined;
      }>
    ) => {
      state.map((index) => {
        if (index.token === action.payload.token) {
          index.ltp = action.payload.lp;
          if (action.payload.pc) {
            index.pc = action.payload.pc;
          }
        }
        return index;
      });
    },
  },
});

export const { updateLtp } = indexWatchSlice.actions;

export default indexWatchSlice.reducer;
