"use client";

import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Script } from "@/types";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useToast } from "../ui/use-toast";
import WlScript from "./WlScript";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { VyStocks } from "@/lib/VyStocks";

const Watchlist = ({
  vy,
  handleSelect,
}: {
  vy: VyStocks;
  handleSelect: Function;
}) => {
  const [tabId, setTabId] = useState("1");

  const [stext, setStext] = useState("");
  const [searchResult, setSearchResult] = useState<Script[]>([]);
  const watchlist = useSelector((store: RootState) => store.watchlist);
  const { toast } = useToast();

  useEffect(() => {
    if (stext.length < 3) return;
    const to = setTimeout(async () => {
      const data = {
        stext,
      };
      let res = await vy.searchScript(data);
      if (res.stat === "Ok") {
        setSearchResult(res.values);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res?.emsg,
        });
      }
    }, 1000);
    return () => {
      clearTimeout(to);
    };
  }, [stext]);

  return (
    <div className="w-full flex flex-col md:w-96 space-y-3 mt-8 md:mt-0">
      <div className="relative flex gap-2 px-4">
        <div className="relative w-full">
          <Input
            type="text"
            value={stext}
            onChange={(e) => setStext(e.target.value)}
            placeholder="Stric price"
            className="w-full"
          />
          {stext.length > 0 && (
            <XMarkIcon
              onClick={() => {
                setSearchResult([]);
                setStext("");
              }}
              className="size-4 absolute right-1 top-3 cursor-pointer"
            />
          )}
        </div>
        {searchResult.length > 0 && (
          <div className="z-10 absolute top-10 inset-x-2 h-52 overflow-y-scroll rounded-b-xl bg-gray-600">
            {searchResult.map((script) => (
              <div
                key={script.token}
                onClick={() => {
                  handleSelect(script, tabId);
                  setSearchResult([]);
                  setStext("");
                }}
                className="text-sm flex justify-between cursor-pointer px-4 hover:bg-slate-700"
              >
                <span>{script.tsym}</span>
                <span>{script.optt}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <Tabs
        defaultValue={tabId}
        onValueChange={(val) => {
          setTabId(val);
        }}
        className="flex flex-col grow"
      >
        <div className="h-72 md:grow overflow-y-scroll">
          <TabsContent
            value="1"
            className="flex flex-wrap items-center justify-around gap-3 mt-0"
          >
            {watchlist[0].length > 0 ? (
              watchlist[0].map((script) => (
                <WlScript
                  key={script.token}
                  script={script}
                  vy={vy}
                  tabId="1"
                />
              ))
            ) : (
              <span>Add Symbol</span>
            )}
          </TabsContent>
          <TabsContent
            value="2"
            className="flex flex-wrap items-center justify-around gap-3 mt-0 "
          >
            {watchlist[1].length > 0 ? (
              watchlist[1].map((script) => (
                <WlScript
                  key={script.token}
                  script={script}
                  vy={vy}
                  tabId="2"
                />
              ))
            ) : (
              <span>Add Symbol</span>
            )}
          </TabsContent>
          <TabsContent
            value="3"
            className="flex flex-wrap items-center justify-around gap-3 mt-0 "
          >
            {watchlist[2].length > 0 ? (
              watchlist[2].map((script) => (
                <WlScript
                  key={script.token}
                  script={script}
                  vy={vy}
                  tabId="3"
                />
              ))
            ) : (
              <span>Add Symbol</span>
            )}
          </TabsContent>
        </div>

        <div className="flex justify-center mt-2">
          <TabsList className="">
            <TabsTrigger value="1">1</TabsTrigger>
            <TabsTrigger value="2">2</TabsTrigger>
            <TabsTrigger value="3">3</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
};

export default Watchlist;
