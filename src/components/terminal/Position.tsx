"use client";
import { PositionBook } from "@/types";
import React, { useRef, useState } from "react";
import { Button } from "../ui/button";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Input } from "../ui/input";
import { OrderShema } from "@/validation/order";
import { useToast } from "../ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { VyStocks } from "@/lib/VyStocks";

const Position = ({
  position,
  vy,
}: {
  position: PositionBook;
  vy: VyStocks;
}) => {
  const [editSl, setEditSl] = useState(false);
  const [sl, setSl] = useState<number | null>(null);
  const slInpRef = useRef<HTMLInputElement>(null);

  const [editTgt, setEditTgt] = useState(false);
  const [tgt, setTgt] = useState<number | null>(null);
  const tgtInpRef = useRef<HTMLInputElement>(null);

  const [editTsl, setEditTsl] = useState(false);
  const [tsl, setTsl] = useState<number | null>(null);
  const tslInpRef = useRef<HTMLInputElement>(null);
  const tslPrice = useRef<number | null>(null);

  const [showNewOrder, setShowNewOrder] = useState(false);
  const [prctyp, setPrctyp] = useState("LMT");
  const qtyInpRef = useRef<HTMLInputElement>(null);
  const prcInpRef = useRef<HTMLInputElement>(null);

  const exQtyInpRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  function handleSetSl() {
    if (!slInpRef.current) {
      setEditSl(false);
      setSl(null);
      return;
    }

    setSl(parseFloat(slInpRef.current.value));
    setEditSl(false);
  }

  function handleSetTsl() {
    if (!sl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Set SL first",
      });
      return;
    }
    if (!tslInpRef.current) {
      setEditTsl(false);
      setTsl(null);
      tslPrice.current = null;
      return;
    }

    setTsl(parseFloat(tslInpRef.current.value));
    tslPrice.current = parseFloat(position.lp);
    setEditTsl(false);
  }

  function handleSetTgt() {
    if (!tgtInpRef.current) {
      setEditTgt(false);
      setTgt(null);
      return;
    }
    setTgt(parseFloat(tgtInpRef.current.value));
    setEditTgt(false);
  }

  if (tsl) {
    if (!tslPrice.current) return;
    if (!sl) return;
    if (!position.lp) return;

    if (parseInt(position.netqty) > 0) {
      let diff = parseFloat(position.lp) - tslPrice.current;
      if (diff > tsl) {
        setSl((prev) => prev! + diff);
        tslPrice.current = parseFloat(position.lp);
      }
    }

    if (parseInt(position.netqty) < 0) {
      let diff = tslPrice.current - parseFloat(position.lp);
      if (diff > tsl) {
        setSl((prev) => prev! - diff);
        tslPrice.current = parseFloat(position.lp);
      }
    }
  }

  if (sl) {
    if (parseInt(position.netqty) > 0) {
      if (sl > parseFloat(position.lp)) {
        console.log("sl tiggerd");
        handleClosePosition(position.netqty);
      }
    }
    if (parseInt(position.netqty) < 0) {
      if (sl < parseFloat(position.lp)) {
        console.log("sl tiggerd");
        handleClosePosition(position.netqty);
      }
    }
  }
  // some chamte gor git
  if (tgt) {
    if (parseInt(position.netqty) > 0) {
      if (tgt < parseFloat(position.lp)) {
        console.log("Target Hit");
        handleClosePosition(position.netqty);
      }
    }
    if (parseInt(position.netqty) < 0) {
      if (tgt > parseFloat(position.lp)) {
        console.log("Target Hit");
        handleClosePosition(position.netqty);
      }
    }
  }

  async function handleClosePosition(qty: string) {
    setSl(null);
    setTsl(null);
    setTgt(null);
    tslPrice.current = null;
    let data = {
      exch: position.exch,
      tsym: position.tsym,
      qty: Math.abs(parseInt(qty)).toString(),
      prd: position.prd,
      trantype: parseInt(position.netqty) < 0 ? "B" : "S",
      prctyp: "MKT",
      prc: "0",
      // parseInt(position.netqty) < 0
      //   ? (
      //       parseFloat(position.lp) +
      //       Math.round((parseFloat(position.lp) * 0.01) / 0.05) * 0.05
      //     ).toFixed(2)
      //   : (
      //       parseFloat(position.lp) -
      //       Math.round((parseFloat(position.lp) * 0.01) / 0.05) * 0.05
      //     ).toFixed(2),
    };
    const validData = OrderShema.safeParse(data);
    if (!validData.success) {
      console.log(validData.error.flatten());
      return;
    }

    const res = await vy.placeOrder({ ...validData.data });
    if (res.stat !== "Ok") {
      toast({
        variant: "destructive",
        title: "Error",
        description: res.emsg,
      });
    } else {
      toast({
        title: "Position Closed",
        description: position.tsym,
      });
    }
  }

  async function newOrder() {
    /* let data = {
      exch: position.exch,
      tsym: position.tsym,
      qty: qtyInpRef.current?.value,
      prd: position.prd,
      trantype: "B",
      prctyp: prctyp,
      prc: "0",
    };
    if (prctyp === "LMT") {
      if (!prcInpRef.current) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Price is required.",
        });
        return;
      }
      data.prc = prcInpRef.current?.value;
    }

    const validData = OrderShema.safeParse(data);
    if (!validData.success) {
      console.log(validData.error.flatten());
      toast({
        variant: "destructive",
        title: "Error",
        description: "All Field are Required",
      });
      return;
    }
    console.log(validData.data);
    const orderReq = accounts.map((acc) => {
      validData.data.uid = acc.userId;
      validData.data.actid = acc.userId;
      if (acc.broker === "finvasia") {
        return fvPlaceOrder({ ...validData.data }, acc.token!);
      } else {
        return ftPlaceOrder({ ...validData.data }, acc.token!);
      }
    });
    const orderRes = await Promise.allSettled(orderReq);
    orderRes.forEach((or) => {
      console.log(or);
      if (or.status === "fulfilled") {
        if (or.value.res.stat === "Ok") {
          toast({
            title: "Order Placed",
            description: `${or.value.uid} : ${or.value.res.norenordno}`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Order rejected",
            description: `${or.value.uid} : ${or.value.res.emsg}`,
          });
        }
      } else {
        console.log(or.reason);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Daya kuch to gadbd hai",
        });
      }
    });
    setShowNewOrder(false); */
  }

  return parseInt(position.netqty) !== 0 ? (
    <div className="flex justify-between items-center text-xs md:text-sm border-y px-2 gap-4 mt-1 p-1">
      <div className="w-full flex flex-col lg:flex-row gap-2 justify-between items-center">
        <div className="w-full flex text-xs justify-between md:justify-start items-center gap-2">
          <span>{position.tsym}</span>
          <span>
            Qty:{position.netqty} | AP:{position.netavgprc} | LP:
            {position.lp}
          </span>
          <Button
            onClick={() => {
              handleClosePosition(position.netqty);
            }}
            variant="outline"
            size="sm"
            className="h-4 p-2 flex md:hidden"
          >
            <XMarkIcon className="size-4" />
          </Button>
        </div>
        <div className="w-full flex justify-between items-center lg:justify-end gap-4">
          <div className="relative flex text-xs items-center gap-2">
            <span className="">Qty</span>
            <Input
              className="w-12 h-6 text-xs px-2"
              key={position.netqty}
              type="number"
              // ref={exQtyInpRef}
              max={position.netqty}
              min={position.ls}
              step={position.ls}
              defaultValue={position.netqty}
              placeholder="Qty"
            />
          </div>
          {/* SL input */}
          {editSl ? (
            <div className="flex items-center">
              <XMarkIcon
                onClick={() => setEditSl(false)}
                className="size-4 cursor-pointer"
              />
              <Input
                ref={slInpRef}
                defaultValue={sl ? sl : ""}
                className="w-16 h-6 text-xs px-2"
              />
              <CheckIcon
                onClick={handleSetSl}
                className="size-4 cursor-pointer"
              />
            </div>
          ) : sl ? (
            <div className="relative w-24 text-xs flex gap-2">
              <span className="text-red-600">SL :</span>
              <span onClick={() => setEditSl(true)} className="cursor-pointer">
                {sl.toFixed(2)}
              </span>
            </div>
          ) : (
            <span
              onClick={() => setEditSl(true)}
              className="cursor-pointer text-xs w-24"
            >
              Set SL
            </span>
          )}
          {/* TSL Input */}
          {editTsl ? (
            <div className="flex items-center">
              <XMarkIcon
                onClick={() => setEditTsl(false)}
                className="size-4 cursor-pointer"
              />
              <Input
                ref={tslInpRef}
                defaultValue={tsl ? tsl : ""}
                placeholder="TSL"
                className="w-12 h-6 text-xs px-2"
              />
              <CheckIcon
                onClick={handleSetTsl}
                className="size-4 cursor-pointer"
              />
            </div>
          ) : tsl ? (
            <div className="relative text-xs flex gap-2 w-20">
              <span className="text-red-600">TSL :</span>
              <span onClick={() => setEditTsl(true)} className="cursor-pointer">
                {tsl}
              </span>
            </div>
          ) : (
            <span
              onClick={() => setEditTsl(true)}
              className="cursor-pointer text-xs w-20"
            >
              Set TSL
            </span>
          )}
          {/* TGT Input */}
          {editTgt ? (
            <div className="flex items-center">
              <XMarkIcon
                onClick={() => setEditTgt(false)}
                className="size-4 cursor-pointer"
              />
              <Input
                ref={tgtInpRef}
                defaultValue={tgt ? tgt : ""}
                className="w-16 h-6 text-xs px-2"
                placeholder="Target"
              />
              <CheckIcon
                onClick={handleSetTgt}
                className="size-4 cursor-pointer"
              />
            </div>
          ) : tgt ? (
            <div className="relative text-xs flex gap-2 w-24">
              <span className="text-red-600">TGT :</span>
              <span onClick={() => setEditTgt(true)} className="cursor-pointer">
                {tgt}
              </span>
            </div>
          ) : (
            <span
              onClick={() => setEditTgt(true)}
              className="cursor-pointer text-xs w-24"
            >
              Set TGT
            </span>
          )}
        </div>
      </div>
      <div className="hidden  md:flex flex-col md:flex-row items-center justify-center gap-2">
        {/* <div className="text-xs">
          {(
            parseFloat(position.netqty) *
              (parseFloat(position.lp) - parseFloat(position.netavgprc)) *
              parseFloat(position.prcftr) +
            parseFloat(position.rpnl)
          ).toFixed(2)}
        </div> */}
        <Button
          onClick={() => {
            handleClosePosition(position.netqty);
          }}
          variant="outline"
          size="sm"
          className="h-6 p-2"
        >
          <XMarkIcon className="size-4" />
        </Button>
      </div>
    </div>
  ) : showNewOrder ? (
    <div className="flex justify-between items-center text-xs border-y px-2 gap-4 mt-1 p-1">
      <div className="grow flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
        <div className="flex justify-between items-center grow">
          <span className="w-20 lg:w-40 overflow-hidden grow">
            {position.tsym}
          </span>
          <span>LTP:{position.lp}</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div
              className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-['C'] peer-checked:after:content-['M']
          after:text-gray-800 after:text-center after:text-sm after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
            ></div>
          </label>
          <Input
            ref={qtyInpRef}
            placeholder="qty"
            type="number"
            defaultValue={position.ls}
            min={position.ls}
            className="h-6 w-12 p-1 text-xs px-2"
          />
          <Select value={prctyp} onValueChange={(val) => setPrctyp(val)}>
            <SelectTrigger className="w-16 h-6 text-xs px-2">
              <SelectValue placeholder="Order Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LMT">LMT</SelectItem>
              <SelectItem value="MKT">MARKET</SelectItem>
              <SelectItem value="SLM">test</SelectItem>
            </SelectContent>
          </Select>
          <Input
            ref={prcInpRef}
            placeholder={position.lp}
            type="number"
            min={position.ti}
            className="h-6 w-20 p-1 text-xs px-2 text-right"
          />
        </div>
        <div className="flex justify-around gap-2">
          <Button
            onClick={newOrder}
            variant="outline"
            size="sm"
            className="h-6 p-2 bg-rose-500"
          >
            Sell
          </Button>
          <Button
            onClick={newOrder}
            variant="outline"
            size="sm"
            className="h-6 p-2 bg-teal-500"
          >
            Buy
          </Button>
        </div>
      </div>
      <div className="flex">
        <Button
          onClick={() => setShowNewOrder(false)}
          variant="outline"
          size="sm"
          className="h-6 p-2"
        >
          <XMarkIcon className="size-4 text-red-500" />
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex justify-between items-center text-xs md:text-sm border-y px-2 gap-4 mt-1 p-1">
      <div className="w-full flex item-center gap-2">
        <div className="w-28 lg:w-60 overflow-hidden">{position.tsym}</div>
        <div className="flex w-40">
          <div className="flex gap-2">
            <span>LTP</span>
            <span className="w-16">{position.lp ?? 0}</span>
          </div>
          <div className="flex gap-2">
            <span>Profit/Loss</span>
            <span className="text-right">{position.rpnl}</span>
          </div>
        </div>
      </div>
      <div>
        <Button
          onClick={() => setShowNewOrder(true)}
          variant="outline"
          size="sm"
          className="h-6 p-2"
        >
          +
        </Button>
      </div>
    </div>
  );
};

export default Position;
