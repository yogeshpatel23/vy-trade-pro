"use client";
import { IAccount } from "@/models/Account";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Watchlist from "./Watchlist";
import { Script, WsResponse } from "@/types";
import { useToast } from "../ui/use-toast";
import {
  initOrderlist,
  removeOrdrer,
  updateOrderltp,
} from "@/store/orderlistSlice";
import { RootState } from "@/store";
import { Orders } from "./Orders";
import { initPositions, updatePositonltp } from "@/store/positionsSlice";
import Position from "./Position";
import { addToWatchlist, updateScript } from "@/store/watchlistSlice";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  SignalIcon,
  SignalSlashIcon,
} from "@heroicons/react/24/outline";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { VyStocks } from "@/lib/VyStocks";
import { Finvasia } from "@/lib/Finvasia";
import IndexList from "./index-list";
import { updateLtp } from "@/store/indexWatchSlice";
import { Flattrade } from "@/lib/Flattrade";

const Terminal = ({ account, wsurl }: { account: IAccount; wsurl: string }) => {
  const ws = useRef<WebSocket>();
  const vy = useRef<VyStocks>(
    account.broker === "finvasia"
      ? new Finvasia(account.userId, account.token!)
      : new Flattrade(account.userId, account.token!)
  );
  const [isWsOpen, setIsWsOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch();
  const { toast } = useToast();

  const orders = useSelector((store: RootState) => store.orderlist);
  const positons = useSelector((store: RootState) => store.positions);
  const watchlist = useSelector((store: RootState) => store.watchlist);

  async function getOrders() {
    let orders = await vy.current.getOrderBook();
    if ("stat" in orders) {
      toast({ description: orders.emsg });
      return;
    }
    const openOrders = orders.filter(
      (o) =>
        o.status === "PENDING" ||
        o.status === "TRIGGER_PENDING" ||
        o.status === "OPEN"
    );
    dispatch(initOrderlist(openOrders));
    return openOrders;
  }

  async function getPositions() {
    let positions = await vy.current.getPositions();

    if ("stat" in positions) {
      toast({ description: positions.emsg });
      return;
    }

    dispatch(initPositions(positions));
    return positions;
  }

  function wsOpen(this: WebSocket, ev: Event) {
    console.log(new Date(), "ws Open");
    setIsWsOpen(true);
    setOpen(false);
    this.send(
      JSON.stringify({
        t: "c",
        uid: account.userId,
        actid: account.userId,
        source: "API",
        susertoken: account.token,
      })
    );

    let tokens: string[] = ["NSE|26000", "NSE|26009", "NSE|26037"];
    Promise.allSettled([getOrders(), getPositions()]).then((responses) => {
      if (responses[0].status === "fulfilled") {
        if (responses[0].value) {
          responses[0].value.forEach((o) => {
            tokens.push(`${o.exch}|${o.token}`);
          });
        }
      }
      if (responses[1].status === "fulfilled") {
        if (responses[1].value) {
          responses[1].value.forEach((p) => {
            tokens.push(`${p.exch}|${p.token}`);
          });
        }
      }

      console.log(tokens);
      ws.current?.send(
        JSON.stringify({
          t: "t",
          k: tokens.join("#"),
        })
      );
    });
  }

  function wsMsg(this: WebSocket, ev: MessageEvent<string>) {
    let data: WsResponse = JSON.parse(ev.data);

    switch (data.t) {
      case "ck":
        // Subcibe to Order
        this.send(
          JSON.stringify({
            t: "o",
            uid: account.userId,
            actid: account.userId,
          })
        );
        // Subscribe watchlist ietms
        let tokens: string[] = [];

        this.send(
          JSON.stringify({
            t: "t",
            k: tokens.join("#"),
          })
        );
        break;
      case "tk":
      case "tf":
        if (data.lp) {
          dispatch(updateScript({ token: data.tk, lp: data.lp }));
          dispatch(updateOrderltp({ token: data.tk, lp: data.lp }));
          dispatch(updatePositonltp({ token: data.tk, lp: data.lp }));
          dispatch(updateLtp({ token: data.tk, lp: data.lp, pc: data.pc }));
        }
        break;
      case "om":
        switch (data.reporttype) {
          case "New":
          case "Replaced":
          case "TriggerPending":
            getOrders();
            break;
          case "Canceled":
            dispatch(removeOrdrer(data.norenordno));
            break;
          case "Fill":
            toast({
              title: "Order Filled",
              description: `${data.tsym} Qty: ${data.flqty} @ ${data.flprc}`,
            });
            if (data.status === "COMPLETE") {
              dispatch(removeOrdrer(data.norenordno));
            } else {
              console.log("fill");
              console.log(data);
            }
            // audioPlayer.current?.play();
            console.log("position uptat4");
            getPositions();
            break;
          case "Rejected":
            toast({ variant: "destructive", description: data.rejreason });
            // getOrders(vy);
            // audioPlayer.current?.play();
            break;
          case "NewAck":
          case "ModAck":
          case "PendingNew":
          case "PendingReplace":
          case "PendingCancel":
            break;

          default:
            console.log(data);
            break;
        }
        break;
      case "am":
        toast({ title: "Message", description: data.dmsg });
        console.log(data);
        break;
      default:
        console.log(data);
        break;
    }
  }

  function connectWs() {
    if (ws.current) {
      ws.current.close();
    }
    ws.current = new WebSocket(wsurl);
    ws.current.onopen = wsOpen;
    ws.current.onmessage = wsMsg;
    ws.current.onclose = (ev) => {
      console.log(new Date(), "ws close");
      setIsWsOpen(false);
      setOpen(true);
      console.log(ev);
    };
    ws.current.onerror = (ev) => {
      console.error(ev);
    };
  }
  useEffect(() => {
    connectWs();
    const iter = setInterval(() => {
      ws.current?.send(
        JSON.stringify({
          t: "h",
        })
      );
    }, 50000);
    return () => {
      clearInterval(iter);
      if (ws.current) {
        console.log("close ws");
        ws.current.close(3000);
      }
    };
  }, []);

  function handleSelect(script: Script, tabId: string) {
    if (ws.current?.readyState === 1) {
      ws.current.send(
        JSON.stringify({
          t: "t",
          k: `${script.exch}|${script.token}`,
        })
      );
    }
    dispatch(addToWatchlist({ script, tabId }));
  }
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="fixed flex gap-2 top-2 right-2 p-1 z-10">
        <Link href="/dashboard">
          <HomeIcon className="size-7 cursor-pointer rounded-full border border-white/50 p-1 hover:animate-pulse" />
        </Link>
        {isWsOpen ? (
          <SignalIcon
            onClick={connectWs}
            className="size-7 cursor-pointer rounded-full border border-white/50 p-1 text-green-500 animate-pulse hover:animate-spin"
          />
        ) : (
          <SignalSlashIcon
            onClick={connectWs}
            className="size-7 cursor-pointer rounded-full border border-white/50 p-1 text-red-500 hover:animate-spin"
          />
        )}
      </div>
      <Watchlist handleSelect={handleSelect} vy={vy.current} />
      <div className="border relative mt-2 md:mt-0 grow pt-2 md:pt-4">
        <IndexList />
        <div className="h-28 md:mt-8">
          <h2 className="text-sm text-green-600 px-2">Orders</h2>
          <div className="overflow-y-scroll">
            {orders.length === 0 ? (
              <p className="px-2">No Order to show</p>
            ) : (
              orders.map((order) => (
                <Orders key={order.norenordno} order={order} vy={vy.current} />
              ))
            )}
          </div>
        </div>
        <div>
          <h2 className="text-sm text-green-600 px-2">Positions</h2>
          {positons.length === 0 ? (
            <p className="px-2">No Position</p>
          ) : (
            positons.map((pos) => (
              <Position key={pos.tsym} position={pos} vy={vy.current} />
            ))
          )}
        </div>
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-4 text-red-500">
              <ExclamationTriangleIcon className="size-10" />
              Websocket is Disconnected!
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={connectWs}>Refresh</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Terminal;
