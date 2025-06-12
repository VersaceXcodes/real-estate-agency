
import { db } from '../db';
import { clientInterestsTable } from '../db/schema';
import { type UpdateClientInterestInput, type ClientInterest } from '../schema';
import { eq } from 'drizzle-orm';

export const updateClientInterest = async (input: UpdateClientInterestInput): Promise<ClientInterest> => {
  try {
    // Update client interest record
    const result = await db.update(clientInterestsTable)
      .set({
        interestLevel: input.interestLevel
      })
      .where(eq(clientInterestsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`ClientInterest with id ${input.id} not found`);
    }

    // Return the updated client interest
    const clientInterest = result[0];
    return {
      ...clientInterest,
      clientId: clientInterest.clientId,
      propertyId: clientInterest.propertyId
    };
  } catch (error) {
    console.error('Client interest update failed:', error);
    throw error;
  }
};
