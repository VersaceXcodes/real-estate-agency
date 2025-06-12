
import { db } from '../db';
import { clientsTable } from '../db/schema';
import { type GetByIdInput, type Client } from '../schema';
import { eq } from 'drizzle-orm';

export const getClientById = async (input: GetByIdInput): Promise<Client> => {
  try {
    const result = await db.select()
      .from(clientsTable)
      .where(eq(clientsTable.id, input.id))
      .execute();

    if (result.length === 0) {
      throw new Error(`Client with id ${input.id} not found`);
    }

    const client = result[0];
    return {
      ...client,
      budget: client.budget ? parseFloat(client.budget) : null
    };
  } catch (error) {
    console.error('Failed to get client by id:', error);
    throw error;
  }
};
