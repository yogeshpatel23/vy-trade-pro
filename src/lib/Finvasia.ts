import { IAccount } from "@/models/Account";
import { VyStocks } from "./VyStocks";
import * as OTPAuth from "otpauth";
import { sha256 } from "js-sha256";
import { ErrorResponse, FVLoginResponse } from "@/types";

export class Finvasia extends VyStocks {
  baseurl: string = "https://api.shoonya.com/NorenWClientTP";
  constructor(uid: string, key: string) {
    super(uid, key);
  }

  static async login(
    account: IAccount
  ): Promise<FVLoginResponse | ErrorResponse> {
    let totp = new OTPAuth.TOTP({
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: account.totpCode,
    });
    let otp = totp.generate();
    try {
      const response = await fetch(
        "https://api.shoonya.com/NorenWClientTP/QuickAuth",
        {
          method: "POST",
          body: `jData=${JSON.stringify({
            apkversion: "1.0.0",
            uid: account.userId,
            pwd: sha256(account.password),
            factor2: otp,
            vc: account.secret,
            appkey: sha256(`${account.userId}|${account.key}`),
            imei: "abcd123",
            source: "API",
          })}`,
        }
      );
      return await response.json();
    } catch (error: any) {
      console.log("Login Error : ", error.message);
      return { stat: "Not_Ok", emsg: "Someting went wrong" };
    }
  }
}
