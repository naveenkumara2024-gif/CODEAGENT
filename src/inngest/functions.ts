// src/inngest/functions.ts
import { inngest } from "./client";
import { Sandbox } from "e2b";
import { getSandbox } from "./utils";
import { createAgent, openai, createTool, createNetwork } from '@inngest/agent-kit';
import { z } from "zod";
import { PROMPT } from "../prompt/constant";
import { lastAssistantTextMessageContent } from "./utils";
export const processTask = inngest.createFunction(
  { id: "process-task", triggers: { event: "app/task.created" } },
  async ({ event, step }) => {
    let createdSandbox: Sandbox | undefined;

    try {
      const sandboxId = await step.run("get-sandbox-id", async () => {
        createdSandbox = await Sandbox.create("coden_agent-dev-2");
        return createdSandbox.sandboxId;
      });
      const codeagent = createAgent({
        name: 'Coden NEXT-JS Agent',
        system: PROMPT,
        model: openai({
          model: 'poolside/laguna-xs.2:free', // or 'google/gemini-2.5-pro', 'openai/gpt-4o', etc.
          apiKey: process.env.OPENROUTER_API_KEY,
          baseUrl: 'https://openrouter.ai/api/v1',
          defaultParameters: {
            temperature: 0.1,
          },
        }),
        tools: [
          createTool({
            name: 'Terminal',
            description: 'Use the terminal to run commands',
            parameters: z.object({
              command: z.string(),
            }),
            handler: async ({ command }, { step }) => {
              return await step?.run("run-terminal-command", async () => {
                const buffer = { stdout: "", stderr: "" };
                try {
                  const sandbox = await getSandbox(sandboxId);
                  const result = await sandbox.commands.run(command, {
                    onStdout: (data: string) => {
                      buffer.stdout += data;
                    },
                    onStderr: (data: string) => {
                      buffer.stderr += data;
                    }
                  });
                  return result.stdout;
                }
                catch (e) {
                  console.error(
                    `command Failed: ${e} \nstdout: ${buffer.stdout} \nstderr: ${buffer.stderr}`
                  );
                  return `command Failed: ${e} \nstdout: ${buffer.stdout} \nstderr: ${buffer.stderr}`;
                }
              });
            },
          }),
          createTool({
            name: 'CreateorUpdateFile',
            description: 'Create or update a file in the sandbox',
            parameters: z.object({
              files: z.array(
                z.object({
                  path: z.string(),
                  content: z.string()
                })
              )
            }),
            handler: async ({ files }, { step, network }) => {
              const newFiles = await step?.run("create-update-files", async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }
                  return updatedFiles;
                }
                catch (e) {
                  return `Error: ${e}`;
                }
              });
              if (newFiles && typeof newFiles === 'object') {
                network.state.data.files = newFiles;
              }
            }
          }),
          createTool({
            name: 'ReadFile',
            description: 'Read a file from the sandbox',
            parameters: z.object({
              files: z.array(
                z.string()
              ),
            }),
            handler: async ({ files }, { step }) => {
              return await step?.run("readfile", async () => {

                try {
                 
                  const sandbox = await getSandbox(sandboxId);
                  const contents = [];
                  for (const file of files) {
                    const content = await sandbox.files.read(file);
                    contents.push({ path: file, content });
                  }
                  return JSON.stringify(contents);
                }
                catch (e) {
                  return `Error: ${e}`;
                }
              });
            }
          }),
        ],
        lifecycle: {
          onResponse: async ({ result, network }) => {
            const lastAssistantTextMessage = lastAssistantTextMessageContent(result);
            if (lastAssistantTextMessage && network) {
              if (lastAssistantTextMessage.includes("<task_summary>")) {
                network.state.data.summary = lastAssistantTextMessage;
              }
            }
            return result;
          }
        }
      }
      );
      const network = createNetwork({
        name: 'Coden Agent Network',
        agents: [codeagent],
        maxIter: 15,
        router: async ({ network }) => {
          const summary = network.state.data.summary;
          if (summary && summary.includes("<task_summary>")) {
            return
          }
          return codeagent;
        },
      })

      const result = await network.run(event.data.value)
      const geturl = await step.run("get-url", async () => {
        const sandbox = await getSandbox(sandboxId);
        const host = sandbox.getHost(3000);
        return `http://${host}`;
      });
      return {
        SandboxUrl: `The sandbox is running at ${geturl}`,
        title: "Task completed successfully",
        files: result.state.data.files || {},
        summary: result.state.data.summary || "No summary available",
      };
    } catch (error) {
      console.error("Failed to process sandbox task:", error);
      throw error;
    }
  }
);