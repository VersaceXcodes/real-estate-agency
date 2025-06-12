
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { type CreatePropertyInput } from '../schema';
import { getProperties } from '../handlers/get_properties';

// Test property data
const testProperty1: CreatePropertyInput = {
  address: '123 Main St',
  price: 250000,
  bedrooms: 3,
  bathrooms: 2,
  squareFootage: 1500,
  type: 'House',
  status: 'Available',
  description: 'Beautiful family home'
};

const testProperty2: CreatePropertyInput = {
  address: '456 Oak Ave',
  price: 180000,
  bedrooms: 2,
  bathrooms: 1,
  squareFootage: 1200,
  type: 'Apartment',
  status: 'Under Contract',
  description: null
};

describe('getProperties', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no properties exist', async () => {
    const result = await getProperties();
    expect(result).toEqual([]);
  });

  it('should return all properties', async () => {
    // Insert test properties
    await db.insert(propertiesTable)
      .values([
        {
          ...testProperty1,
          price: testProperty1.price.toString(),
          squareFootage: testProperty1.squareFootage.toString()
        },
        {
          ...testProperty2,
          price: testProperty2.price.toString(),
          squareFootage: testProperty2.squareFootage.toString()
        }
      ])
      .execute();

    const result = await getProperties();

    expect(result).toHaveLength(2);
    
    // Check first property
    const property1 = result.find(p => p.address === '123 Main St');
    expect(property1).toBeDefined();
    expect(property1!.price).toEqual(250000);
    expect(typeof property1!.price).toBe('number');
    expect(property1!.squareFootage).toEqual(1500);
    expect(typeof property1!.squareFootage).toBe('number');
    expect(property1!.bedrooms).toEqual(3);
    expect(property1!.bathrooms).toEqual(2);
    expect(property1!.type).toEqual('House');
    expect(property1!.status).toEqual('Available');
    expect(property1!.description).toEqual('Beautiful family home');
    expect(property1!.id).toBeDefined();
    expect(property1!.created_at).toBeInstanceOf(Date);

    // Check second property
    const property2 = result.find(p => p.address === '456 Oak Ave');
    expect(property2).toBeDefined();
    expect(property2!.price).toEqual(180000);
    expect(typeof property2!.price).toBe('number');
    expect(property2!.squareFootage).toEqual(1200);
    expect(typeof property2!.squareFootage).toBe('number');
    expect(property2!.bedrooms).toEqual(2);
    expect(property2!.bathrooms).toEqual(1);
    expect(property2!.type).toEqual('Apartment');
    expect(property2!.status).toEqual('Under Contract');
    expect(property2!.description).toBeNull();
    expect(property2!.id).toBeDefined();
    expect(property2!.created_at).toBeInstanceOf(Date);
  });

  it('should handle properties with different types and statuses', async () => {
    // Insert property with different enum values
    await db.insert(propertiesTable)
      .values({
        address: '789 Pine Rd',
        price: '350000',
        bedrooms: 4,
        bathrooms: 3,
        squareFootage: '2000',
        type: 'Condo',
        status: 'Sold',
        description: 'Luxury condo'
      })
      .execute();

    const result = await getProperties();

    expect(result).toHaveLength(1);
    expect(result[0].type).toEqual('Condo');
    expect(result[0].status).toEqual('Sold');
    expect(result[0].price).toEqual(350000);
    expect(result[0].squareFootage).toEqual(2000);
  });
});
