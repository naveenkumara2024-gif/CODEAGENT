import { createTRPCRouter } from '../init';
import { messageProcedure } from '@/module/message/server/procedure';

export const appRouter = createTRPCRouter({
    message: messageProcedure,
    
});

export type AppRouter = typeof appRouter;