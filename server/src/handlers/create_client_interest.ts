
import { db } from '../db';
import { clientInterestsTable, clientsTable, propertiesTable } from '../db/schema';
import { type CreateClientInterestInput, type ClientInterest } from '../schema';
import { eq } from 'drizzle-orm';

export const createClientInterest = async (input: CreateClientInterestInput): Promise<ClientInterest> => {
  try {
    // Verify client exists
    const client = await db.select()
      .from(clientsTable)
      .where(eq(clientsTable.id, input.clientId))
      .execute();

    if (client.length === 0) {
      throw new Error(`Client with id ${input.clientId} does not exist`);
    }

    // Verify property exists
    const property = await db.select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, input.propertyId))
      .execute();

    if (property.length === 0) {
      throw new Error(`Property with id ${input.propertyId} does not exist`);
    }

    // Insert client interest record
    const result = await db.insert(clientInterestsTable)
      .values({
        clientId: input.clientId,
        propertyId: input.propertyId,
        interestLevel: input.interestLevel
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Client interest creation failed:', error);
    throw error;
  }
};
