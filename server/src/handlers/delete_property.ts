
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type DeleteInput } from '../schema';

export const deleteProperty = async (input: DeleteInput): Promise<{ success: boolean }> => {
  try {
    const result = await db.delete(propertiesTable)
      .where(eq(propertiesTable.id, input.id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Property deletion failed:', error);
    throw error;
  }
};
