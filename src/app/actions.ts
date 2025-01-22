"use server";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/dbConnect";
import { Finvasia } from "@/lib/Finvasia";
import { Flattrade } from "@/lib/Flattrade";
import Account, { IAccount } from "@/models/Account";
import { VySession } from "@/types";
import { AccountSchema } from "@/validation";
import { HydratedDocument, MongooseError, Types } from "mongoose";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getAccounts() {
  const session: VySession | null = await getServerSession(authOptions);
  if (!session || !session.user?.id) return null;
  const user: string = session.user.id;
  await dbConnect();
  try {
    const accounts: HydratedDocument<IAccount>[] = await Account.aggregate([
      {
        $match: {
          user: new Types.ObjectId(user),
        },
      },
      {
        $project: {
          _id: {
            $toString: "$_id",
          },
          user: {
            $toString: "$user",
          },
          name: 1,
          userId: 1,
          broker: 1,
          password: 1,
          totpCode: 1,
          secret: 1,
          key: 1,
          isActive: 1,
          token: 1,
          tokenExp: 1,
        },
      },
    ]);
    return accounts;
  } catch (error) {
    if (error instanceof MongooseError) {
      console.log(error.message);
    }
    return null;
  }
}

export async function addAccount(prevState: any, formdata: FormData) {
  try {
    const data = Object.fromEntries(formdata.entries());
    const validatedFields = AccountSchema.safeParse(data);
    if (!validatedFields.success) {
      return {
        success: {},
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }
    //Todo:: Fix this any in code
    const session: VySession | null = await getServerSession(authOptions);
    if (!session || !session.user?.id) throw new Error();
    const id = session.user.id;
    await dbConnect();
    const account: HydratedDocument<IAccount> | null = await Account.findOne({
      userId: validatedFields.data.userId,
    });
    if (account) {
      return {
        errors: {
          message: "User id Already Added to an account",
        },
      };
    }
    const newaccount: HydratedDocument<IAccount> = await Account.create({
      user: id,
      ...validatedFields.data,
    });
  } catch (error: any) {
    if (error instanceof MongooseError) {
      console.log(error);
      return {
        errors: {
          message: "All field are required",
        },
      };
    }
    return {
      errors: {
        message: "Something went wrong",
      },
    };
  }
  redirect("/dashboard");
}

export async function getAccount(id: string) {
  try {
    await dbConnect();
    const account: HydratedDocument<IAccount>[] = await Account.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(id),
        },
      },
      {
        $project: {
          _id: {
            $toString: "$_id",
          },
          user: {
            $toString: "$user",
          },
          name: 1,
          userId: 1,
          broker: 1,
          password: 1,
          totpCode: 1,
          secret: 1,
          key: 1,
          sActive: 1,
          token: 1,
          tokenExp: 1,
        },
      },
    ]);
    if (account.length == 0) throw new Error();
    return account[0];
  } catch (e) {
    console.log(e);
  }
}

export async function editAccount(formState: any, formdata: FormData) {
  // Todo:: Add error handel
  const rawData = Object.fromEntries(formdata.entries());
  const validatedFields = AccountSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  await dbConnect();
  let account = await Account.findByIdAndUpdate(
    { _id: rawData.id },
    validatedFields.data
  );
  redirect("/dashboard");
}

export async function deleteAccount(formState: any, formdata: FormData) {
  const id = formdata.get("id");
  if (typeof id != "string")
    return {
      message: "Something went wrong",
    };
  await dbConnect();
  const result = await Account.findByIdAndDelete(new Types.ObjectId(id));
  if (!result) {
    return {
      message: "Something went wrong",
    };
  }
  revalidatePath("/dashboard");
}

export async function getToken(formState: any, formdata: FormData) {
  const id = formdata.get("id");
  await dbConnect();
  const account: HydratedDocument<IAccount> | null = await Account.findById(id);
  if (!account) return { message: "Daya kuch to gadbad hai" };
  if (account.broker === "finvasia") {
    const res = await Finvasia.login(account);
    if (res.stat === "Ok") {
      account.token = res.susertoken;
      account.save();
    } else {
      return {
        message: res.emsg,
      };
    }
  } else {
    const res = await Flattrade.login(account);
    if (res.stat === "Ok") {
      account.token = res.token;
      account.save();
    } else {
      return {
        message: res.emsg,
      };
    }
  }
  revalidatePath("/dashboard");
}
