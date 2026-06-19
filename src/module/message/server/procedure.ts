import { prisma } from "../../../lib/db";
import { z } from "zod";
import {baseProcedure, createTRPCRouter} from "../../../trpc/init";
import { inngest } from "@/inngest/client";

export const messageProcedure = createTRPCRouter({
    create: baseProcedure
        .input(
            z.object({
                value: z.string().min(1, { message: "Message must be at least 1 character long" }),
            })
        ).mutation(async ({ input}) => {
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
        })
})
