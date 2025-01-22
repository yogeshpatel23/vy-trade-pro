"use client";
import { OrderBook } from "@/types";
import React, { useRef, useState } from "react";
import { Button } from "../ui/button";
import { CheckIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useToast } from "../ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { MOSchema } from "@/validation/order";
import { VyStocks } from "@/lib/VyStocks";

export const Orders = ({ order, vy }: { order: OrderBook; vy: VyStocks }) => {
  const [editMode, setEditMode] = useState(false);
  const [prctyp, setPrctyp] = useState(order.prctyp);

  const qtyRef = useRef<HTMLInputElement>(null);
  const prcRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  async function handleCancle() {
    const res = await vy.cancelOrder({ norenordno: order.norenordno });
    if (res.stat !== "Ok") {
      toast({
        variant: "destructive",
        title: "Order Cancelation Error",
        description: res.emsg,
      });
    } else {
      toast({
        title: "Order Canceled",
        description: `Order No: ${res.result}`,
      });
    }
  }

  async function handleModify() {
    let price =
      order.trantype === "B"
        ? parseFloat(prcRef.current?.value ?? "0") +
          Math.round((parseFloat(prcRef.current?.value ?? "0") * 0.01) / 0.05) *
            0.05
        : parseFloat(prcRef.current?.value ?? "0") -
          Math.round((parseFloat(prcRef.current?.value ?? "0") * 0.01) / 0.05) *
            0.05;
    const data: any = {
      exch: order.exch,
      norenordno: order.norenordno,
      tsym: order.tsym,
      qty: qtyRef.current?.value,
      prctyp: prctyp === "MKT" ? "LMT" : prctyp,
      prc: price.toString(),
    };
    if (prctyp === "LMT") {
      if (!prcRef.current) return;
      data.prc = prcRef.current.value;
    }
    if (prctyp === "SL-LMT") {
      if (!prcRef.current) return;
      if (order.trantype === "B") {
        if (parseFloat(prcRef.current.value) < parseFloat(order.ltp!)) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Triger price greater then LTP",
          });
        }
        data.trgprc = prcRef.current.value;
        data.prc = (
          parseFloat(prcRef.current.value) +
          Math.round((parseFloat(prcRef.current.value) * 0.01) / 0.05) * 0.05
        ).toString();
      } else {
        if (parseFloat(prcRef.current.value) > parseFloat(order.ltp!)) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Triger price smaller then LTP",
          });
        }
        data.trgprc = prcRef.current.value;
        data.prc = (
          parseFloat(prcRef.current.value) -
          Math.round((parseFloat(prcRef.current.value) * 0.01) / 0.05) * 0.05
        ).toString();
      }
    }
    const validData = MOSchema.safeParse(data);
    if (!validData.success) {
      console.log(validData.error.flatten());
      toast({
        variant: "destructive",
        title: "Error",
        description: "Some field are missing",
      });
      return;
    }
    const res = await vy.modifyOrder({ ...validData.data });
    if (res.stat !== "Ok") {
      toast({
        variant: "destructive",
        title: "Order Modificaion Error",
        description: res.emsg,
      });
    } else {
      toast({
        title: "Order Modified",
        description: `Order No: ${res.result}`,
      });
    }
    setEditMode(false);
  }

  return editMode ? (
    <div className="flex justify-between items-center bg-gray-800/50 text-xs md:text-sm border-y px-2 gap-4">
      <div className="w-full flex flex-col md:flex-row justify-between md:items-center p-1 gap-2 md:gap-8">
        <div className="flex justify-between md:justify-start md:gap-2 grow">
          <span>{order.tsym}</span>
          <span>{order.ltp}</span>
        </div>
        <div className="flex justify-between md:justify-end grow">
          <div className="flex items-center">
            <span className="mr-2">Qty:</span>
            <Input
              id="qty"
              defaultValue={order.qty}
              key={order.tsym}
              ref={qtyRef}
              type="number"
              step={order.ls}
              min={order.ls}
              className="w-16 h-6"
            />
          </div>
          <div>
            <Select value={prctyp} onValueChange={(v) => setPrctyp(v)}>
              <SelectTrigger id="prctyp" className="h-6">
                <SelectValue placeholder="Select Index" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LMT">LIMIT</SelectItem>
                <SelectItem value="MKT">MARKET</SelectItem>
                <SelectItem value="SL-LMT">SL-LMT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Input
              type="number"
              ref={prcRef}
              min={order.ti}
              defaultValue={order.prc}
              placeholder={order.ltp ?? "Price"}
              className="w-20 h-6"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-1">
        <Button
          onClick={handleModify}
          size="sm"
          variant="outline"
          className="h-6 p-2"
        >
          <CheckIcon className="size-4" />
        </Button>
        <Button
          onClick={() => setEditMode(false)}
          size="sm"
          variant="destructive"
          className="h-6 p-2"
        >
          <XMarkIcon className="size-4" />
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex justify-between items-center text-xs md:text-sm border-y p-2 gap-4">
      <div className="w-full flex flex-col md:flex-row justify-between gap-2 md:gap-8">
        <div className="flex justify-between grow">
          <span>{order.tsym}</span>
          <span>Qty :{order.qty}</span>
        </div>
        <div className="flex justify-between grow">
          <div>{order.prctyp}</div>
          <div>LTP: {order.ltp ?? "00.00"}</div>
          <div>Price: {order.prc}</div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-1">
        <Button
          onClick={() => setEditMode(true)}
          size="sm"
          variant="outline"
          className="h-6 p-2"
        >
          <PencilIcon className="size-4" />
        </Button>
        <Button
          onClick={handleCancle}
          size="sm"
          variant="outline"
          className="h-6 p-2"
        >
          <XMarkIcon className="size-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
};
