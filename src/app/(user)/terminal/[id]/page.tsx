import { getAccount, getAccounts } from "@/app/actions";
import StoreProvider from "@/components/StoreProvider";
import Terminal from "@/components/terminal/Terminal";
import { Finvasia } from "@/lib/Finvasia";
import { VyStocks } from "@/lib/VyStocks";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function TerminalPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect("/");
  }
  const id = params.id;

  const account = await getAccount(id);

  if (!account) redirect("/dashboard");

  if (!(account.token != "" && account.tokenExp === new Date().toDateString()))
    redirect("/dashboard");

  let vy: VyStocks;
  let wsurl: string;
  if (account.broker === "finvasia") {
    wsurl = "wss://api.shoonya.com/NorenWSTP/";
  } else {
    wsurl = "wss://piconnect.flattrade.in/PiConnectWSTp/";
  }
  return (
    <StoreProvider>
      <Terminal account={account} wsurl={wsurl} />
    </StoreProvider>
  );
}
