
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { clientInterestsTable, clientsTable, propertiesTable } from '../db/schema';
import { type CreateClientInterestInput } from '../schema';
import { createClientInterest } from '../handlers/create_client_interest';
import { eq } from 'drizzle-orm';

describe('createClientInterest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let clientId: number;
  let propertyId: number;

  // Helper to create prerequisite data
  const createPrerequisiteData = async () => {
    // Create a client
    const clientResult = await db.insert(clientsTable)
      .values({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-1234',
        budget: '500000',
        desiredPropertyType: 'House'
      })
      .returning()
      .execute();
    clientId = clientResult[0].id;

    // Create a property
    const propertyResult = await db.insert(propertiesTable)
      .values({
        address: '123 Main St',
        price: '450000',
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: '2000',
        type: 'House',
        status: 'Available',
        description: 'Beautiful house'
      })
      .returning()
      .execute();
    propertyId = propertyResult[0].id;
  };

  it('should create a client interest', async () => {
    await createPrerequisiteData();

    const testInput: CreateClientInterestInput = {
      clientId: clientId,
      propertyId: propertyId,
      interestLevel: 'High'
    };

    const result = await createClientInterest(testInput);

    // Basic field validation
    expect(result.clientId).toEqual(clientId);
    expect(result.propertyId).toEqual(propertyId);
    expect(result.interestLevel).toEqual('High');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save client interest to database', async () => {
    await createPrerequisiteData();

    const testInput: CreateClientInterestInput = {
      clientId: clientId,
      propertyId: propertyId,
      interestLevel: 'Medium'
    };

    const result = await createClientInterest(testInput);

    // Query using proper drizzle syntax
    const clientInterests = await db.select()
      .from(clientInterestsTable)
      .where(eq(clientInterestsTable.id, result.id))
      .execute();

    expect(clientInterests).toHaveLength(1);
    expect(clientInterests[0].clientId).toEqual(clientId);
    expect(clientInterests[0].propertyId).toEqual(propertyId);
    expect(clientInterests[0].interestLevel).toEqual('Medium');
    expect(clientInterests[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when client does not exist', async () => {
    await createPrerequisiteData();

    const testInput: CreateClientInterestInput = {
      clientId: 99999, // Non-existent client ID
      propertyId: propertyId,
      interestLevel: 'Low'
    };

    await expect(createClientInterest(testInput))
      .rejects.toThrow(/Client with id 99999 does not exist/i);
  });

  it('should throw error when property does not exist', async () => {
    await createPrerequisiteData();

    const testInput: CreateClientInterestInput = {
      clientId: clientId,
      propertyId: 99999, // Non-existent property ID
      interestLevel: 'Low'
    };

    await expect(createClientInterest(testInput))
      .rejects.toThrow(/Property with id 99999 does not exist/i);
  });

  it('should create multiple interests for same client', async () => {
    await createPrerequisiteData();

    // Create another property
    const propertyResult2 = await db.insert(propertiesTable)
      .values({
        address: '456 Oak Ave',
        price: '350000',
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: '1500',
        type: 'Apartment',
        status: 'Available',
        description: 'Cozy apartment'
      })
      .returning()
      .execute();
    const propertyId2 = propertyResult2[0].id;

    // Create first interest
    const testInput1: CreateClientInterestInput = {
      clientId: clientId,
      propertyId: propertyId,
      interestLevel: 'High'
    };

    // Create second interest
    const testInput2: CreateClientInterestInput = {
      clientId: clientId,
      propertyId: propertyId2,
      interestLevel: 'Medium'
    };

    const result1 = await createClientInterest(testInput1);
    const result2 = await createClientInterest(testInput2);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.clientId).toEqual(clientId);
    expect(result2.clientId).toEqual(clientId);
    expect(result1.propertyId).toEqual(propertyId);
    expect(result2.propertyId).toEqual(propertyId2);
  });
});
