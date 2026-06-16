// src/inngest/functions.ts
import { inngest } from "./client";
import { Sandbox } from "e2b";
import { getSandbox } from "./utils";
export const processTask = inngest.createFunction(
  { id: "process-task", triggers: { event: "app/task.created" } },
  async ({ step }) => {
    let createdSandbox: Sandbox | undefined;

    try {
      const sandboxId = await step.run("get-sandbox-id", async () => {
        createdSandbox = await Sandbox.create("coden_agent-dev-2");
        return createdSandbox.sandboxId;
      });
      const geturl = await step.run("get-url", async () => {
        const sandbox = await getSandbox(sandboxId);
        const host = sandbox.getHost(3000);
        return `http://${host}`;
      });
      return { output: `The sandbox is running at ${geturl}` };
    } catch (error) {
      console.error("Failed to process sandbox task:", error);
      throw error;
    } finally {
      if (createdSandbox) {
        try {
          await createdSandbox.kill();
        } catch (cleanupError) {
          console.error("Failed to clean up sandbox:", cleanupError);
        }
      }
    }
  }
);