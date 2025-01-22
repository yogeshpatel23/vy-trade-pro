import { Session } from "next-auth";
import { ErrorResponse } from "./error-response";
import { FVLoginResponse } from "./fv-login-response";
import { SearchResponse } from "./searchResponse";
import { Script } from "./nfoScript";
import { OrderResponse } from "./orderResponse";
import { CancelOrderResponse } from "./cancelOrderResponse";
import { WsResponse } from "./websocketResponce";
import { OrderBook } from "./orderbook";
import { PositionBook } from "./positionbook";

export interface VySession extends Session {
  user?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export type {
  ErrorResponse,
  FVLoginResponse,
  SearchResponse,
  Script,
  OrderResponse,
  CancelOrderResponse,
  OrderBook,
  PositionBook,
  WsResponse,
};
