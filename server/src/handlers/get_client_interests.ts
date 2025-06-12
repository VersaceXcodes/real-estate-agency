
import { db } from '../db';
import { clientInterestsTable } from '../db/schema';
import { type ClientInterest } from '../schema';

export const getClientInterests = async (): Promise<ClientInterest[]> => {
  try {
    const results = await db.select()
      .from(clientInterestsTable)
      .execute();

    return results.map(result => ({
      ...result,
      // No numeric conversions needed - all fields are integers or enums
      id: result.id,
      clientId: result.clientId,
      propertyId: result.propertyId,
      interestLevel: result.interestLevel,
      created_at: result.created_at
    }));
  } catch (error) {
    console.error('Failed to get client interests:', error);
    throw error;
  }
};
