import { prisma } from "../../../lib/db";
import { z } from "zod";
import {baseProcedure, createTRPCRouter} from "../../../trpc/init";
import { inngest } from "@/inngest/client";

export const messageProcedure = createTRPCRouter({
    getmessages: baseProcedure.query(async () => {
        try {
            const messages = await prisma.message.findMany({
                orderBy: {
                    createdAt: "desc"
                }
            });
            return messages;
        } catch (error) {
            console.error("Failed to fetch messages:", error);
            throw error;
        }
    }),
    create: baseProcedure
        .input(
            z.object({
                value: z.string().min(1, { message: "Message must be at least 1 character long" }),
            })
        ).mutation(async ({ input}) => {
            try {
                const createdMessage = await prisma.message.create({
                    data: {
                        content: input.value,
                        role: "USER",
                        type: "RESULT",
                    },
                });
                await inngest.send({
                    name: "app/task.created",
                    data: {
                        value: input.value,
                    },
                });
                return createdMessage;
            } catch (error) {
                console.error("Failed to create message or send event:", error);
                throw error;
            }
        })        
})
