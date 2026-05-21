'use client';
import { Button } from "@/components/ui/button"
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
const Page = () => {
  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess( data) {
      toast.success(`Task invoked successfully! ${data.ok}`);
    }
  }));

  return (
    <div className="flex justify-center h-full items-center">
      <Button disabled={invoke.isPending} onClick={() => invoke.mutate({ text: "Hello, world!" })}>
        Click me
      </Button>
    </div>
  )
}

export default Page