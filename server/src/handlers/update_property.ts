
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { type UpdatePropertyInput, type Property } from '../schema';
import { eq } from 'drizzle-orm';

export const updateProperty = async (input: UpdatePropertyInput): Promise<Property> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {};
    
    if (input.address !== undefined) {
      updateData.address = input.address;
    }
    if (input.price !== undefined) {
      updateData.price = input.price.toString();
    }
    if (input.bedrooms !== undefined) {
      updateData.bedrooms = input.bedrooms;
    }
    if (input.bathrooms !== undefined) {
      updateData.bathrooms = input.bathrooms;
    }
    if (input.squareFootage !== undefined) {
      updateData.squareFootage = input.squareFootage.toString();
    }
    if (input.type !== undefined) {
      updateData.type = input.type;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }

    // Update property record
    const result = await db.update(propertiesTable)
      .set(updateData)
      .where(eq(propertiesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Property with id ${input.id} not found`);
    }

    // Convert numeric fields back to numbers before returning
    const property = result[0];
    return {
      ...property,
      price: parseFloat(property.price),
      squareFootage: parseFloat(property.squareFootage)
    };
  } catch (error) {
    console.error('Property update failed:', error);
    throw error;
  }
};
