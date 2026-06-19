'use client';
import { Button } from "@/components/ui/button"
import { useTRPC } from "@/trpc/client";
import { Input } from "@base-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
const Page = () => {
  const [text, setText] = useState("");
  const trpc = useTRPC();
  const createMessage = useMutation(trpc.message.create.mutationOptions({
    onSuccess: () => {
      toast.success(`Message created successfully!`);
    }
  }));

  return (
    <div className="flex flex-col justify-center h-full items-center p-1">
      <Input placeholder="Enter some text" value={text} onChange={(e) => setText(e.target.value)} className="w-full p-2 mb-1" />
      <Button disabled={createMessage.isPending} onClick={() => createMessage.mutate({ value: text })}>
        Click me
      </Button>
    </div>
  )
}

export default Page