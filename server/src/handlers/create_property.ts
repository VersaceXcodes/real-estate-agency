
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { type CreatePropertyInput, type Property } from '../schema';

export const createProperty = async (input: CreatePropertyInput): Promise<Property> => {
  try {
    // Insert property record
    const result = await db.insert(propertiesTable)
      .values({
        address: input.address,
        price: input.price.toString(), // Convert number to string for numeric column
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        squareFootage: input.squareFootage.toString(), // Convert number to string for numeric column
        type: input.type,
        status: input.status,
        description: input.description
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const property = result[0];
    return {
      ...property,
      price: parseFloat(property.price), // Convert string back to number
      squareFootage: parseFloat(property.squareFootage) // Convert string back to number
    };
  } catch (error) {
    console.error('Property creation failed:', error);
    throw error;
  }
};
