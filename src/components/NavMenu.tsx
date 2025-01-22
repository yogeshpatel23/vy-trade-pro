"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";

const NavMenu = () => {
  const session = useSession();
  return (
    <div className="shadow dark:shadow-gray-400 py-2">
      <div className="flex justify-between items-center container">
        <div>VYTrade pro</div>
        {session.status === "authenticated" ? (
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="mr-4">
              Dashboard
            </Link>
            <Avatar className="size-6">
              {session.data.user?.image && (
                <AvatarImage src={session.data.user?.image} />
              )}
              <AvatarFallback>VY</AvatarFallback>
            </Avatar>
            <span className="text-sm">{session.data.user?.name}</span>
            <span
              className="cursor-pointer"
              onClick={() => {
                signOut();
              }}
            >
              Logout
            </span>
          </div>
        ) : (
          <div
            onClick={() => {
              signIn("google");
            }}
            className="flex gap-2 items-center rounded-full px-2 py-1 ring-1 ring-white cursor-pointer"
          >
            <Image width={20} height={20} src="./google.svg" alt="google" />
            <span className="text-sm">Sign in with Google</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavMenu;
