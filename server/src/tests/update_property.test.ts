
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { type CreatePropertyInput, type UpdatePropertyInput } from '../schema';
import { updateProperty } from '../handlers/update_property';
import { eq } from 'drizzle-orm';

// Helper function to create a test property
const createTestProperty = async (): Promise<number> => {
  const testProperty: CreatePropertyInput = {
    address: '123 Main St',
    price: 250000,
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1500,
    type: 'House',
    status: 'Available',
    description: 'A nice house'
  };

  const result = await db.insert(propertiesTable)
    .values({
      address: testProperty.address,
      price: testProperty.price.toString(),
      bedrooms: testProperty.bedrooms,
      bathrooms: testProperty.bathrooms,
      squareFootage: testProperty.squareFootage.toString(),
      type: testProperty.type,
      status: testProperty.status,
      description: testProperty.description
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('updateProperty', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a property with all fields', async () => {
    const propertyId = await createTestProperty();

    const updateInput: UpdatePropertyInput = {
      id: propertyId,
      address: '456 Oak Ave',
      price: 300000,
      bedrooms: 4,
      bathrooms: 3,
      squareFootage: 2000,
      type: 'Condo',
      status: 'Under Contract',
      description: 'Updated description'
    };

    const result = await updateProperty(updateInput);

    // Verify returned data
    expect(result.id).toEqual(propertyId);
    expect(result.address).toEqual('456 Oak Ave');
    expect(result.price).toEqual(300000);
    expect(typeof result.price).toBe('number');
    expect(result.bedrooms).toEqual(4);
    expect(result.bathrooms).toEqual(3);
    expect(result.squareFootage).toEqual(2000);
    expect(typeof result.squareFootage).toBe('number');
    expect(result.type).toEqual('Condo');
    expect(result.status).toEqual('Under Contract');
    expect(result.description).toEqual('Updated description');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update a property with partial fields', async () => {
    const propertyId = await createTestProperty();

    const updateInput: UpdatePropertyInput = {
      id: propertyId,
      price: 275000,
      status: 'Sold'
    };

    const result = await updateProperty(updateInput);

    // Verify updated fields
    expect(result.price).toEqual(275000);
    expect(result.status).toEqual('Sold');

    // Verify unchanged fields
    expect(result.address).toEqual('123 Main St');
    expect(result.bedrooms).toEqual(3);
    expect(result.bathrooms).toEqual(2);
    expect(result.squareFootage).toEqual(1500);
    expect(result.type).toEqual('House');
    expect(result.description).toEqual('A nice house');
  });

  it('should update property in database', async () => {
    const propertyId = await createTestProperty();

    const updateInput: UpdatePropertyInput = {
      id: propertyId,
      address: '789 Pine St',
      price: 350000
    };

    await updateProperty(updateInput);

    // Verify database record was updated
    const properties = await db.select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, propertyId))
      .execute();

    expect(properties).toHaveLength(1);
    expect(properties[0].address).toEqual('789 Pine St');
    expect(parseFloat(properties[0].price)).toEqual(350000);
  });

  it('should handle null description update', async () => {
    const propertyId = await createTestProperty();

    const updateInput: UpdatePropertyInput = {
      id: propertyId,
      description: null
    };

    const result = await updateProperty(updateInput);

    expect(result.description).toBeNull();
  });

  it('should throw error when property not found', async () => {
    const updateInput: UpdatePropertyInput = {
      id: 99999,
      price: 200000
    };

    await expect(updateProperty(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should update only specified numeric fields', async () => {
    const propertyId = await createTestProperty();

    const updateInput: UpdatePropertyInput = {
      id: propertyId,
      squareFootage: 1800
    };

    const result = await updateProperty(updateInput);

    // Verify only squareFootage was updated
    expect(result.squareFootage).toEqual(1800);
    expect(typeof result.squareFootage).toBe('number');
    
    // Verify price remained unchanged
    expect(result.price).toEqual(250000);
    expect(typeof result.price).toBe('number');
  });
});
