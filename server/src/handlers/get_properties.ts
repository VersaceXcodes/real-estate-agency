
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { type Property } from '../schema';

export const getProperties = async (): Promise<Property[]> => {
  try {
    const results = await db.select()
      .from(propertiesTable)
      .execute();

    // Convert numeric fields back to numbers
    return results.map(property => ({
      ...property,
      price: parseFloat(property.price),
      squareFootage: parseFloat(property.squareFootage)
    }));
  } catch (error) {
    console.error('Get properties failed:', error);
    throw error;
  }
};
