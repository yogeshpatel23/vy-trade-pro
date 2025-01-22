"use client";
import React, { useEffect } from "react";
import { useFormState } from "react-dom";
import { useToast } from "../ui/use-toast";
import { IconSubmitButton } from "../IconSubmitButton";
import { TrashIcon } from "@heroicons/react/24/outline";
import { deleteAccount } from "@/app/actions";

const initialState = {
  message: "",
};

const DeleteAccountForm = ({ id }: { id: string }) => {
  const [formState, formAction] = useFormState(deleteAccount, initialState);
  const { toast } = useToast();
  useEffect(() => {
    if (formState?.message && formState?.message != "") {
      toast({
        variant: "destructive",
        title: "Error",
        description: formState?.message,
      });
    }
  }, [formState?.message]);
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <IconSubmitButton size="sm" variant="outline">
        <TrashIcon className="text-red-500 size-4" />
      </IconSubmitButton>
    </form>
  );
};

export default DeleteAccountForm;
