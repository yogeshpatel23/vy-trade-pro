import { z } from "zod";

const OrderBase = z.object({
  uid: z.string().optional(),
  actid: z.string().optional(),
  exch: z.string(),
  tsym: z.string(),
  qty: z.string(),
  prd: z.enum(["C", "M", "I"]),
  trantype: z.enum(["B", "S"]),
  ret: z.string().default("DAY"),
  remarks: z.string().default("algo-link-v2"),
  ordersource: z.string().default("API"),
});

const OrderMkt = OrderBase.merge(
  z.object({
    prctyp: z.enum(["MKT"]),
    prc: z.string().default("0"),
    mkt_protection: z.string().default("1"),
  })
);
const OrderLimit = OrderBase.merge(
  z.object({
    prctyp: z.enum(["LMT"]),
    prc: z.string().min(1, { message: "Price is required" }),
  })
);

const OrderStopMkt = OrderBase.merge(
  z.object({
    prctyp: z.enum(["SL-LMT"]),
    prc: z.string().default("0"),
    trgprc: z.string().min(1, { message: "Trg Price is required" }),
  })
);

export const OrderShema = z.discriminatedUnion("prctyp", [
  OrderMkt,
  OrderLimit,
  OrderStopMkt,
]);

export type OrderType = z.infer<typeof OrderShema>;

const MOBase = z.object({
  uid: z.string().optional(),
  actid: z.string().optional(),
  exch: z.string(),
  norenordno: z.string(),
  // trantype: z.enum(["B", "S"]),
  tsym: z.string(),
  qty: z.string(),
  ret: z.string().default("DAY"),
});

const MOMkt = MOBase.merge(
  z.object({ prctyp: z.enum(["MKT"]), prc: z.string().default("0") })
);
const MOLimit = MOBase.merge(
  z.object({
    prctyp: z.enum(["LMT"]),
    prc: z.string().min(1, { message: "Price is required" }),
  })
);

const MoStopMkt = MOBase.merge(
  z.object({
    prctyp: z.enum(["SL-LMT"]),
    prc: z.string().default("0"),
    trgprc: z.string().min(1, { message: "Trg Price is required" }),
  })
);

export const MOSchema = z.discriminatedUnion("prctyp", [
  MoStopMkt,
  MOMkt,
  MOLimit,
]);

export type MOrder = z.infer<typeof MOSchema>;
