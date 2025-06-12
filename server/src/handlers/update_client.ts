
import { db } from '../db';
import { clientsTable } from '../db/schema';
import { type UpdateClientInput, type Client } from '../schema';
import { eq } from 'drizzle-orm';

export const updateClient = async (input: UpdateClientInput): Promise<Client> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {};
    
    if (input.firstName !== undefined) updateData.firstName = input.firstName;
    if (input.lastName !== undefined) updateData.lastName = input.lastName;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.budget !== undefined) updateData.budget = input.budget?.toString() ?? null;
    if (input.desiredPropertyType !== undefined) updateData.desiredPropertyType = input.desiredPropertyType;

    // Update client record
    const result = await db.update(clientsTable)
      .set(updateData)
      .where(eq(clientsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Client with id ${input.id} not found`);
    }

    // Convert numeric fields back to numbers before returning
    const client = result[0];
    return {
      ...client,
      budget: client.budget ? parseFloat(client.budget) : null
    };
  } catch (error) {
    console.error('Client update failed:', error);
    throw error;
  }
};
