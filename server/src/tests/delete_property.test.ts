
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { type DeleteInput, type CreatePropertyInput } from '../schema';
import { deleteProperty } from '../handlers/delete_property';
import { eq } from 'drizzle-orm';

// Test input for creating a property to delete
const testPropertyInput: CreatePropertyInput = {
  address: '123 Test Street',
  price: 250000,
  bedrooms: 3,
  bathrooms: 2,
  squareFootage: 1500,
  type: 'House',
  status: 'Available',
  description: 'A test property'
};

describe('deleteProperty', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing property', async () => {
    // Create a property first
    const createdProperty = await db.insert(propertiesTable)
      .values({
        ...testPropertyInput,
        price: testPropertyInput.price.toString(),
        squareFootage: testPropertyInput.squareFootage.toString()
      })
      .returning()
      .execute();

    const propertyId = createdProperty[0].id;

    // Delete the property
    const deleteInput: DeleteInput = { id: propertyId };
    const result = await deleteProperty(deleteInput);

    // Verify deletion was successful
    expect(result.success).toBe(true);

    // Verify property no longer exists in database
    const properties = await db.select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, propertyId))
      .execute();

    expect(properties).toHaveLength(0);
  });

  it('should handle deletion of non-existent property', async () => {
    // Try to delete a property that doesn't exist
    const deleteInput: DeleteInput = { id: 99999 };
    const result = await deleteProperty(deleteInput);

    // Should still return success (idempotent operation)
    expect(result.success).toBe(true);
  });

  it('should not affect other properties when deleting one', async () => {
    // Create two properties
    const property1 = await db.insert(propertiesTable)
      .values({
        ...testPropertyInput,
        address: '123 First Street',
        price: testPropertyInput.price.toString(),
        squareFootage: testPropertyInput.squareFootage.toString()
      })
      .returning()
      .execute();

    const property2 = await db.insert(propertiesTable)
      .values({
        ...testPropertyInput,
        address: '456 Second Street',
        price: testPropertyInput.price.toString(),
        squareFootage: testPropertyInput.squareFootage.toString()
      })
      .returning()
      .execute();

    // Delete the first property
    const deleteInput: DeleteInput = { id: property1[0].id };
    const result = await deleteProperty(deleteInput);

    expect(result.success).toBe(true);

    // Verify first property is deleted
    const deletedProperty = await db.select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, property1[0].id))
      .execute();

    expect(deletedProperty).toHaveLength(0);

    // Verify second property still exists
    const remainingProperty = await db.select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, property2[0].id))
      .execute();

    expect(remainingProperty).toHaveLength(1);
    expect(remainingProperty[0].address).toEqual('456 Second Street');
  });
});
