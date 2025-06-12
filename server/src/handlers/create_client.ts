
import { db } from '../db';
import { clientsTable } from '../db/schema';
import { type CreateClientInput, type Client } from '../schema';

export const createClient = async (input: CreateClientInput): Promise<Client> => {
  try {
    // Insert client record
    const result = await db.insert(clientsTable)
      .values({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        budget: input.budget ? input.budget.toString() : null, // Convert number to string for numeric column
        desiredPropertyType: input.desiredPropertyType
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const client = result[0];
    return {
      ...client,
      budget: client.budget ? parseFloat(client.budget) : null // Convert string back to number
    };
  } catch (error) {
    console.error('Client creation failed:', error);
    throw error;
  }
};
