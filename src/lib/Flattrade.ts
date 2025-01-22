import { IAccount } from "@/models/Account";
import * as OTPAuth from "otpauth";
import { VyStocks } from "./VyStocks";
import { sha256 } from "js-sha256";

export class Flattrade extends VyStocks {
  baseurl: string = "https://piconnect.flattrade.in/PiConnectTP";
  constructor(uid: string, key: string) {
    super(uid, key);
  }

  static async login(account: IAccount) {
    try {
      const rsid = await fetch("https://authapi.flattrade.in/auth/session", {
        method: "POST",
        headers: { referer: "https://auth.flattrade.in/" },
      });
      const sid = await rsid.text();
      let totp = new OTPAuth.TOTP({
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: account.totpCode,
      });

      let otp = totp.generate();
      const hashPass = sha256(account.password);
      const coderes = await fetch("https://authapi.flattrade.in/ftauth", {
        method: "POST",
        body: JSON.stringify({
          UserName: account.userId,
          Password: hashPass,
          PAN_DOB: otp,
          App: "",
          ClientID: "",
          Key: "",
          APIKey: account.key,
          Sid: sid,
          Override: "",
          Source: "AUTHPAGE",
        }),
      });
      const resData = await coderes.json();
      if (resData.emsg != "")
        return {
          stat: "Not_Ok",
          emsg: resData.emsg,
        };

      const rdUrl = new URLSearchParams(resData.RedirectURL.split("?")[1]);
      const code = rdUrl.get("code");
      if (!code) throw Error();
      const response = await fetch(
        "https://authapi.flattrade.in/trade/apitoken",
        {
          method: "POST",
          body: JSON.stringify({
            api_key: account.key,
            request_code: code,
            api_secret: sha256(`${account.key}${code}${account.secret}`),
          }),
        }
      );
      //   if (response.status !== 200) throw new Error(await response.json());
      return await response.json();
    } catch (error) {
      console.log("login error :", error);
    }
  }
}
