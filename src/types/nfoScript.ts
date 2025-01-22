export type Script = {
  exch: "NSE" | "NFO" | "MCX" | "BFO";
  tsym: string;
  token: string;
  instname: string;
  pp: string;
  ti: string;
  ls: string;
  cname?: string;
  dname?: string; // option for MCX
  optt?: string;
  weekly?: string;
  ltp?: string;
};
