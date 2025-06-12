
import { db } from '../db';
import { clientsTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteClient = async (input: DeleteInput): Promise<{ success: boolean }> => {
  try {
    // Delete client record
    const result = await db.delete(clientsTable)
      .where(eq(clientsTable.id, input.id))
      .returning()
      .execute();

    // Return success based on whether a record was deleted
    return { success: result.length > 0 };
  } catch (error) {
    console.error('Client deletion failed:', error);
    throw error;
  }
};
