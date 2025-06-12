
import { db } from '../db';
import { clientInterestsTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteClientInterest = async (input: DeleteInput): Promise<{ success: boolean }> => {
  try {
    const result = await db.delete(clientInterestsTable)
      .where(eq(clientInterestsTable.id, input.id))
      .returning()
      .execute();

    return { success: result.length > 0 };
  } catch (error) {
    console.error('Client interest deletion failed:', error);
    throw error;
  }
};
