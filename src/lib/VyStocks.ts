import {
  CancelOrderResponse,
  ErrorResponse,
  OrderBook,
  OrderResponse,
  PositionBook,
  SearchResponse,
} from "@/types";

export abstract class VyStocks {
  baseurl: string = "";
  constructor(public uid: string, public key: string) {}
  //   abstract placeorder

  async searchScript(data: {}): Promise<SearchResponse | ErrorResponse> {
    return await this.postCall("/SearchScrip", data);
  }

  async getOrderBook(): Promise<OrderBook[] | ErrorResponse> {
    return await this.postCall<OrderBook[] | ErrorResponse>("/OrderBook");
  }

  async getPositions(): Promise<PositionBook[] | ErrorResponse> {
    return await this.postCall<PositionBook[] | ErrorResponse>("/PositionBook");
  }

  async placeOrder(data: {}): Promise<OrderResponse | ErrorResponse> {
    return await this.postCall<OrderResponse | ErrorResponse>(
      "/PlaceOrder",
      data
    );
  }

  async modifyOrder(data: {}): Promise<CancelOrderResponse | ErrorResponse> {
    return await this.postCall<CancelOrderResponse | ErrorResponse>(
      "/ModifyOrder",
      data
    );
  }
  async cancelOrder(data: {}): Promise<CancelOrderResponse | ErrorResponse> {
    return await this.postCall<CancelOrderResponse | ErrorResponse>(
      "/CancelOrder",
      data
    );
  }

  async postCall<T>(endpoint: string, data?: {}): Promise<T> {
    let payload: any = {
      uid: this.uid,
      actid: this.uid,
    };
    if (data) {
      payload = { ...payload, ...data };
    }
    try {
      const response = await fetch(`${this.baseurl}${endpoint}`, {
        headers: { "Content-Type": "text/plain" },
        method: "POST",
        body: `jData=${JSON.stringify(payload)}&jKey=${this.key}`,
      });
      const responseData = await response.json();
      return responseData;
    } catch (error: any) {
      console.log(error);
      // console.log(error.message);
      throw new Error(error.message);
    }
  }
}
