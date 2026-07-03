import { projectProcedure } from '@/module/project/server/procedure';
import { createTRPCRouter } from '../init';
import { messageProcedure } from '@/module/message/server/procedure';

export const appRouter = createTRPCRouter({
    message: messageProcedure,
    project: projectProcedure,
    
});

export type AppRouter = typeof appRouter;