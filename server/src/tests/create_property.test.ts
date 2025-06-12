
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { type CreatePropertyInput } from '../schema';
import { createProperty } from '../handlers/create_property';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreatePropertyInput = {
  address: '123 Main St, Anytown, NY 12345',
  price: 350000.50,
  bedrooms: 3,
  bathrooms: 2,
  squareFootage: 1850.75,
  type: 'House',
  status: 'Available',
  description: 'Beautiful family home with large backyard'
};

describe('createProperty', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a property', async () => {
    const result = await createProperty(testInput);

    // Basic field validation
    expect(result.address).toEqual('123 Main St, Anytown, NY 12345');
    expect(result.price).toEqual(350000.50);
    expect(typeof result.price).toBe('number');
    expect(result.bedrooms).toEqual(3);
    expect(result.bathrooms).toEqual(2);
    expect(result.squareFootage).toEqual(1850.75);
    expect(typeof result.squareFootage).toBe('number');
    expect(result.type).toEqual('House');
    expect(result.status).toEqual('Available');
    expect(result.description).toEqual('Beautiful family home with large backyard');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save property to database', async () => {
    const result = await createProperty(testInput);

    // Query using proper drizzle syntax
    const properties = await db.select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, result.id))
      .execute();

    expect(properties).toHaveLength(1);
    expect(properties[0].address).toEqual('123 Main St, Anytown, NY 12345');
    expect(parseFloat(properties[0].price)).toEqual(350000.50);
    expect(properties[0].bedrooms).toEqual(3);
    expect(properties[0].bathrooms).toEqual(2);
    expect(parseFloat(properties[0].squareFootage)).toEqual(1850.75);
    expect(properties[0].type).toEqual('House');
    expect(properties[0].status).toEqual('Available');
    expect(properties[0].description).toEqual('Beautiful family home with large backyard');
    expect(properties[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle null description', async () => {
    const inputWithNullDescription: CreatePropertyInput = {
      address: '456 Oak Ave, Somewhere, CA 90210',
      price: 500000,
      bedrooms: 4,
      bathrooms: 3,
      squareFootage: 2200,
      type: 'Condo',
      status: 'Under Contract',
      description: null
    };

    const result = await createProperty(inputWithNullDescription);

    expect(result.description).toBeNull();
    expect(result.address).toEqual('456 Oak Ave, Somewhere, CA 90210');
    expect(result.price).toEqual(500000);
    expect(result.type).toEqual('Condo');
    expect(result.status).toEqual('Under Contract');
  });

  it('should handle different property types', async () => {
    const apartmentInput: CreatePropertyInput = {
      address: '789 City Blvd, Unit 42, Metro City, TX 75001',
      price: 225000,
      bedrooms: 2,
      bathrooms: 1,
      squareFootage: 950,
      type: 'Apartment',
      status: 'Sold',
      description: 'Modern apartment in downtown area'
    };

    const result = await createProperty(apartmentInput);

    expect(result.type).toEqual('Apartment');
    expect(result.status).toEqual('Sold');
    expect(result.address).toEqual('789 City Blvd, Unit 42, Metro City, TX 75001');
    expect(result.price).toEqual(225000);
    expect(result.squareFootage).toEqual(950);
  });
});
