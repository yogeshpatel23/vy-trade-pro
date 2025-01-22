import { getAccounts } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PencilIcon, PlayIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import DeleteAccountForm from "@/components/account/DeleteAccountForm";
import GetTokenForm from "@/components/account/GetTokenForm";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  const accounts = await getAccounts();
  return (
    <div className="container">
      <div className="fixed bottom-8 right-6">
        <Link className={buttonVariants()} href="/account/add">
          <PlusIcon className="size-4 mr-2" />
          Add Account
        </Link>
      </div>
      <h2>Accounts</h2>
      <div className="mt-4">
        {accounts?.map((account) => {
          const isValid: boolean =
            account.token != "" &&
            account.tokenExp === new Date().toDateString();
          account._id = account._id?.toString();
          return (
            <Card key={account.userId}>
              <CardContent className="flex p-2 justify-between items-center text-sm">
                <Link
                  href={isValid ? `/terminal/${account._id}` : "#"}
                  className={`${buttonVariants({
                    size: "sm",
                    variant: "outline",
                  })} p-2 mr-2 sm:mr-4 ${
                    isValid
                      ? "text-green-500"
                      : "text-red-500 cursor-not-allowed"
                  } `}
                >
                  <PlayIcon className="size-4" />
                </Link>
                <div className="flex flex-auto gap-4">
                  <span className="basis-24 h-6 overflow-hidden">
                    {account.name}
                  </span>
                  <span className="hidden sm:block capitalize basis-24">
                    {account.broker}
                  </span>
                  <span>{account.userId}</span>
                </div>
                <div className="flex gap-2">
                  <GetTokenForm id={account._id} />
                  {/* <ToggleActiveForm account={account} /> */}
                  <Link
                    href={`/account/edit/${account._id}`}
                    className={buttonVariants({
                      size: "sm",
                      variant: "outline",
                    })}
                  >
                    <PencilIcon className="size-4" />
                  </Link>
                  <DeleteAccountForm id={account._id} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
