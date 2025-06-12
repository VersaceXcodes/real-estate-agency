
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  createPropertyInputSchema,
  updatePropertyInputSchema,
  createClientInputSchema,
  updateClientInputSchema,
  createClientInterestInputSchema,
  updateClientInterestInputSchema,
  deleteInputSchema,
  getByIdInputSchema
} from './schema';

// Import handlers
import { createProperty } from './handlers/create_property';
import { getProperties } from './handlers/get_properties';
import { getPropertyById } from './handlers/get_property_by_id';
import { updateProperty } from './handlers/update_property';
import { deleteProperty } from './handlers/delete_property';
import { createClient } from './handlers/create_client';
import { getClients } from './handlers/get_clients';
import { getClientById } from './handlers/get_client_by_id';
import { updateClient } from './handlers/update_client';
import { deleteClient } from './handlers/delete_client';
import { createClientInterest } from './handlers/create_client_interest';
import { getClientInterests } from './handlers/get_client_interests';
import { updateClientInterest } from './handlers/update_client_interest';
import { deleteClientInterest } from './handlers/delete_client_interest';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Property routes
  createProperty: publicProcedure
    .input(createPropertyInputSchema)
    .mutation(({ input }) => createProperty(input)),
  getProperties: publicProcedure
    .query(() => getProperties()),
  getPropertyById: publicProcedure
    .input(getByIdInputSchema)
    .query(({ input }) => getPropertyById(input)),
  updateProperty: publicProcedure
    .input(updatePropertyInputSchema)
    .mutation(({ input }) => updateProperty(input)),
  deleteProperty: publicProcedure
    .input(deleteInputSchema)
    .mutation(({ input }) => deleteProperty(input)),

  // Client routes
  createClient: publicProcedure
    .input(createClientInputSchema)
    .mutation(({ input }) => createClient(input)),
  getClients: publicProcedure
    .query(() => getClients()),
  getClientById: publicProcedure
    .input(getByIdInputSchema)
    .query(({ input }) => getClientById(input)),
  updateClient: publicProcedure
    .input(updateClientInputSchema)
    .mutation(({ input }) => updateClient(input)),
  deleteClient: publicProcedure
    .input(deleteInputSchema)
    .mutation(({ input }) => deleteClient(input)),

  // ClientInterest routes
  createClientInterest: publicProcedure
    .input(createClientInterestInputSchema)
    .mutation(({ input }) => createClientInterest(input)),
  getClientInterests: publicProcedure
    .query(() => getClientInterests()),
  updateClientInterest: publicProcedure
    .input(updateClientInterestInputSchema)
    .mutation(({ input }) => updateClientInterest(input)),
  deleteClientInterest: publicProcedure
    .input(deleteInputSchema)
    .mutation(({ input }) => deleteClientInterest(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
