
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { type GetByIdInput, type CreatePropertyInput } from '../schema';
import { getPropertyById } from '../handlers/get_property_by_id';

// Test property input
const testProperty: CreatePropertyInput = {
  address: '123 Test Street',
  price: 299999.99,
  bedrooms: 3,
  bathrooms: 2,
  squareFootage: 1800.50,
  type: 'House',
  status: 'Available',
  description: 'Beautiful test property'
};

describe('getPropertyById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should retrieve a property by id', async () => {
    // Create a property first
    const insertResult = await db.insert(propertiesTable)
      .values({
        ...testProperty,
        price: testProperty.price.toString(),
        squareFootage: testProperty.squareFootage.toString()
      })
      .returning()
      .execute();

    const createdProperty = insertResult[0];
    const input: GetByIdInput = { id: createdProperty.id };

    const result = await getPropertyById(input);

    // Validate all fields
    expect(result.id).toEqual(createdProperty.id);
    expect(result.address).toEqual('123 Test Street');
    expect(result.price).toEqual(299999.99);
    expect(typeof result.price).toBe('number');
    expect(result.bedrooms).toEqual(3);
    expect(result.bathrooms).toEqual(2);
    expect(result.squareFootage).toEqual(1800.50);
    expect(typeof result.squareFootage).toBe('number');
    expect(result.type).toEqual('House');
    expect(result.status).toEqual('Available');
    expect(result.description).toEqual('Beautiful test property');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should throw error when property not found', async () => {
    const input: GetByIdInput = { id: 999 };

    await expect(getPropertyById(input)).rejects.toThrow(/Property with id 999 not found/i);
  });

  it('should handle property with null description', async () => {
    // Create property with null description
    const propertyWithNullDesc = {
      ...testProperty,
      description: null
    };

    const insertResult = await db.insert(propertiesTable)
      .values({
        ...propertyWithNullDesc,
        price: propertyWithNullDesc.price.toString(),
        squareFootage: propertyWithNullDesc.squareFootage.toString()
      })
      .returning()
      .execute();

    const createdProperty = insertResult[0];
    const input: GetByIdInput = { id: createdProperty.id };

    const result = await getPropertyById(input);

    expect(result.description).toBeNull();
    expect(result.price).toEqual(299999.99);
    expect(typeof result.price).toBe('number');
    expect(result.squareFootage).toEqual(1800.50);
    expect(typeof result.squareFootage).toBe('number');
  });
});
