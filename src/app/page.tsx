'use client';
import { Button } from "@/components/ui/button"
import { useTRPC } from "@/trpc/client";
import { Input } from "@base-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
const Page = () => {
  const [text, setText] = useState("");
  const trpc = useTRPC();
  const { data: messages } = useQuery(trpc.message.getmessages.queryOptions());
  const createMessage = useMutation(trpc.message.create.mutationOptions({
    onSuccess: () => {
      toast.success(`Message created successfully!`);
    },
    onError: (error) => {
      toast.error(`Error creating message: ${error.message}`);
    }

  }));

  return (
    <div className="flex flex-col justify-center h-full items-center p-1">
      <Input placeholder="Enter some text" value={text} onChange={(e) => setText(e.target.value)} className="w-full p-2 mb-1" />
      <Button disabled={createMessage.isPending} onClick={() => createMessage.mutate({ value: text })}>
        Click me
      </Button>
      <div className="mt-4 w-full max-w-md">
        {messages?.map((message) => (
          <div key={message.id} className="p-2 border-b">
            <p><strong>{message.role}:</strong> {message.content}</p>
            <div className="text-sm text-gray-500">
              message
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Page