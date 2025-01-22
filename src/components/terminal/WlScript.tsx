import { Script } from "@/types";
import { useRef, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { OrderShema } from "@/validation/order";
import { useToast } from "../ui/use-toast";
import { Badge } from "../ui/badge";
import { VyStocks } from "@/lib/VyStocks";
import { ArrowPathIcon, TrashIcon } from "@heroicons/react/24/outline";
import { removeScript } from "@/store/watchlistSlice";
import { useDispatch } from "react-redux";

const WlScript = ({
  script,
  vy,
  tabId,
}: {
  script: Script;
  vy: VyStocks;
  tabId: string;
}) => {
  const [prctyp, setPrctyp] = useState("LMT");
  const [intraday, setIntrady] = useState(script.exch === "NSE" ? true : false);

  const qtyRef = useRef<HTMLInputElement>(null);
  const prcRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const [isWorking, setIsWorking] = useState(false);

  const dispatch = useDispatch();

  async function handleOrder(tt: string) {
    if (!script.ltp) return;
    const data: any = {
      exch: script.exch,
      tsym: script.tsym,
      qty: qtyRef.current?.value,
      prd: intraday ? "I" : script.exch === "NSE" ? "C" : "M",
      trantype: tt,
      prctyp: prctyp === "MKT" ? "LMT" : prctyp,
      prc:
        tt === "B"
          ? (
              parseFloat(script.ltp) +
              Math.round((parseFloat(script.ltp) * 0.01) / 0.05) * 0.05
            ).toFixed(parseInt(script.pp))
          : (
              parseFloat(script.ltp) -
              Math.round((parseFloat(script.ltp) * 0.01) / 0.05) * 0.05
            ).toFixed(parseInt(script.pp)),
    };
    if (prctyp === "LMT") {
      if (!prcRef.current) return;
      data.prc = prcRef.current.value;
    }
    if (prctyp === "SL-LMT") {
      if (!prcRef.current) return;
      if (
        tt === "B" &&
        parseFloat(prcRef.current.value) < parseFloat(script.ltp!)
      ) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Trigger price higher then LTP",
        });
        prcRef.current.classList.add("border-red-500");
        return;
      }
      if (
        tt === "S" &&
        parseFloat(prcRef.current.value) > parseFloat(script.ltp!)
      ) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Trigger price lower then LTP",
        });
        prcRef.current.classList.add("border-red-500");
        return;
      }
      data.trgprc = prcRef.current.value;
      data.prc =
        tt === "B"
          ? (
              parseFloat(prcRef.current.value) +
              Math.round((parseFloat(prcRef.current.value) * 0.01) / 0.05) *
                0.05
            ).toFixed(parseInt(script.pp))
          : (
              parseFloat(prcRef.current.value) -
              Math.round((parseFloat(prcRef.current.value) * 0.01) / 0.05) *
                0.05
            ).toFixed(parseInt(script.pp));
    }
    setIsWorking(true);
    const validData = OrderShema.safeParse(data);
    if (!validData.success) {
      console.log(validData.error.flatten());
      toast({
        variant: "destructive",
        title: "Error",
        description: "Some field are missing",
      });

      setIsWorking(false);
      return;
    }

    const res = await vy.placeOrder({ ...validData.data });
    prcRef.current?.classList.remove("border-red-500");
    if (res.stat !== "Ok") {
      toast({
        variant: "destructive",
        title: "Error",
        description: res.emsg,
      });
    } else {
      toast({
        variant: "default",
        title: "Order Placed",
        description: `Order No. ${res.norenordno} is Placed`,
      });
    }
    setIsWorking(false);
  }

  return (
    <div className="relative border-y px-4 py-2 space-y-3 grow">
      <div className="flex justify-between items-center text-sm">
        <div>
          <span>{script.tsym}</span>
        </div>
        <span>LTP: {script.ltp ?? 0}</span>
      </div>
      <div className="flex items-center justify-between">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={intraday}
            onChange={() => {
              setIntrady(!intraday);
            }}
            className="sr-only peer"
          />
          <div
            className="relative w-20 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-['CNC'] peer-checked:after:content-['MIS']
          after:text-gray-800 after:text-center after:text-sm after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-10 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
          ></div>
        </label>
        <Label htmlFor="qty" className="font-thin">
          Qty:
        </Label>
        <Input
          id="qty"
          defaultValue={script.ls}
          key={script.tsym}
          ref={qtyRef}
          type="number"
          step={script.ls}
          min={script.ls}
          className="w-14 h-6 px-1"
        />
        <Select value={prctyp} onValueChange={(v) => setPrctyp(v)}>
          <SelectTrigger id="prctyp" className="h-6 w-18 px-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LMT">LIMIT</SelectItem>
            <SelectItem value="MKT">MKT</SelectItem>
            <SelectItem value="SL-LMT">SLM</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          ref={prcRef}
          min={script.ti}
          placeholder={script.ltp ?? "Price"}
          className="w-20 h-6"
        />
      </div>
      <div className="flex justify-around">
        <Button
          onClick={() => handleOrder("S")}
          disabled={isWorking}
          size="sm"
          className="p-2 h-6 w-16 font-bold text-sm text-white bg-rose-700"
        >
          {isWorking ? (
            <ArrowPathIcon className="size-4 animate-spin" />
          ) : (
            "Sell"
          )}
        </Button>
        <Button
          onClick={() => handleOrder("B")}
          disabled={isWorking}
          size="sm"
          className="p-2 h-6 w-16 font-bold text-sm bg-teal-500"
        >
          {isWorking ? (
            <ArrowPathIcon className="size-4 animate-spin" />
          ) : (
            "Buy"
          )}
        </Button>
      </div>
      <TrashIcon
        className="size-4 text-red-600 cursor-pointer absolute bottom-2 right-4"
        onClick={() => {
          dispatch(removeScript({ token: script.token, tabid: tabId }));
        }}
      />
    </div>
  );
};

export default WlScript;
