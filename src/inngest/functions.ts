// src/inngest/functions.ts
import { inngest } from "./client";
import { createAgent, gemini } from '@inngest/agent-kit';
import { Sandbox } from "e2b";
import { getSandbox } from "./utils";
export const processTask = inngest.createFunction(
  { id: "process-task", triggers: { event: "app/task.created" } },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("coden_agent-dev-2");
      return sandbox.sandboxId;
    });
    const codeagent = createAgent({
      name: 'Code assistant',
      description: 'Provides expert support for writing and debugging code',
      system:
        'You are a PostgreSQL expert database administrator. ' +
        'You only provide answers to questions related to PostgreSQL database schema, indexes, and extensions.',
      model: gemini({
        model: 'gemini-1.5-flash'
      }),
    });

    const geturl = await step.run("get-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `http://${host}`;
    });
    return { output: `The sandbox is running at ${geturl}` };
  }
);