'use client';
import { Button } from "@/components/ui/button"
import { useTRPC } from "@/trpc/client";
import { Input } from "@base-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
const Page = () => {
  const [text, setText] = useState("");
  const trpc = useTRPC();
  const router = useRouter();
  const createProject = useMutation(trpc.project.create.mutationOptions({
    onError: (error) => {
      toast.error(`Error creating project: ${error.message}`);
    },
    onSuccess: (data) => {
      router.push(`/project/${data.id}`);
    }

  }));
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="max-w-screen mx-auto flex items-center flex-col gap-4 justify-center">
        <Input placeholder="Enter some text" value={text} onChange={(e) => setText(e.target.value)} />
        <Button disabled={createProject.isPending} onClick={() => createProject.mutate({ value: text })}>
          Submit
        </Button>
      </div>

    </div>
  )
}

export default Page