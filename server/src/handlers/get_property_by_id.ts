
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { type GetByIdInput, type Property } from '../schema';
import { eq } from 'drizzle-orm';

export const getPropertyById = async (input: GetByIdInput): Promise<Property> => {
  try {
    const result = await db.select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, input.id))
      .execute();

    if (result.length === 0) {
      throw new Error(`Property with id ${input.id} not found`);
    }

    const property = result[0];
    return {
      ...property,
      price: parseFloat(property.price),
      squareFootage: parseFloat(property.squareFootage)
    };
  } catch (error) {
    console.error('Get property by id failed:', error);
    throw error;
  }
};
