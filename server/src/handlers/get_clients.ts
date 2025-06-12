
import { db } from '../db';
import { clientsTable } from '../db/schema';
import { type Client } from '../schema';

export const getClients = async (): Promise<Client[]> => {
  try {
    const results = await db.select()
      .from(clientsTable)
      .execute();

    // Convert numeric fields back to numbers
    return results.map(client => ({
      ...client,
      budget: client.budget ? parseFloat(client.budget) : null
    }));
  } catch (error) {
    console.error('Failed to get clients:', error);
    throw error;
  }
};
