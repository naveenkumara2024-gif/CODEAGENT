import { prisma } from "../../../lib/db";
import { z } from "zod";
import {baseProcedure, createTRPCRouter} from "../../../trpc/init";
import { inngest } from "@/inngest/client";
import { generateSlug } from "random-word-slugs";
export const projectProcedure = createTRPCRouter({
    getprojects: baseProcedure.query(async () => {
        try {
            const projects = await prisma.project.findMany({
                orderBy: {
                    createdAt: "desc"
                }
            });
            return projects;
        } catch (error) {
            console.error("Failed to fetch projects:", error);
            throw error;
        }
    }),
    create: baseProcedure
        .input(
            z.object({
                value: z.string().min(1, { message: "Project name must be at least 1 character long" }),
            })
        ).mutation(async ({ input}) => {
            try {
                const createdProject = await prisma.project.create({
                    data: {
                        name: generateSlug(2,{
                            format: "kebab",
                        }),
                        messages: {
                            create: {
                                content: input.value,
                                role: "USER",
                                type: "RESULT",
                            }
                        }
                    },
                });
                await inngest.send({
                    name: "app/task.created",
                    data: {
                        value: input.value,
                        projectId: createdProject.id,
                    },
                });
                return createdProject;
            } catch (error) {
                console.error("Failed to create project or send event:", error);
                throw error;
            }
        })        
})
