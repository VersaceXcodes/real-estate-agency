
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { clientInterestsTable, clientsTable, propertiesTable } from '../db/schema';
import { type UpdateClientInterestInput, type CreateClientInput, type CreatePropertyInput } from '../schema';
import { updateClientInterest } from '../handlers/update_client_interest';
import { eq } from 'drizzle-orm';

// Test data setup
const testClient: CreateClientInput = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '555-0123',
  budget: 300000,
  desiredPropertyType: 'House'
};

const testProperty: CreatePropertyInput = {
  address: '123 Test St',
  price: 250000,
  bedrooms: 3,
  bathrooms: 2,
  squareFootage: 1500,
  type: 'House',
  status: 'Available',
  description: 'Test property'
};

describe('updateClientInterest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update client interest level', async () => {
    // Create prerequisite data
    const clientResult = await db.insert(clientsTable)
      .values({
        firstName: testClient.firstName,
        lastName: testClient.lastName,
        email: testClient.email,
        phone: testClient.phone,
        budget: testClient.budget?.toString(),
        desiredPropertyType: testClient.desiredPropertyType
      })
      .returning()
      .execute();

    const propertyResult = await db.insert(propertiesTable)
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

    // Create client interest
    const interestResult = await db.insert(clientInterestsTable)
      .values({
        clientId: clientResult[0].id,
        propertyId: propertyResult[0].id,
        interestLevel: 'Low'
      })
      .returning()
      .execute();

    const updateInput: UpdateClientInterestInput = {
      id: interestResult[0].id,
      interestLevel: 'High'
    };

    const result = await updateClientInterest(updateInput);

    // Basic field validation
    expect(result.id).toEqual(interestResult[0].id);
    expect(result.clientId).toEqual(clientResult[0].id);
    expect(result.propertyId).toEqual(propertyResult[0].id);
    expect(result.interestLevel).toEqual('High');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated client interest to database', async () => {
    // Create prerequisite data
    const clientResult = await db.insert(clientsTable)
      .values({
        firstName: testClient.firstName,
        lastName: testClient.lastName,
        email: testClient.email,
        phone: testClient.phone,
        budget: testClient.budget?.toString(),
        desiredPropertyType: testClient.desiredPropertyType
      })
      .returning()
      .execute();

    const propertyResult = await db.insert(propertiesTable)
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

    // Create client interest
    const interestResult = await db.insert(clientInterestsTable)
      .values({
        clientId: clientResult[0].id,
        propertyId: propertyResult[0].id,
        interestLevel: 'Medium'
      })
      .returning()
      .execute();

    const updateInput: UpdateClientInterestInput = {
      id: interestResult[0].id,
      interestLevel: 'High'
    };

    const result = await updateClientInterest(updateInput);

    // Query database to verify update
    const savedInterest = await db.select()
      .from(clientInterestsTable)
      .where(eq(clientInterestsTable.id, result.id))
      .execute();

    expect(savedInterest).toHaveLength(1);
    expect(savedInterest[0].interestLevel).toEqual('High');
    expect(savedInterest[0].clientId).toEqual(clientResult[0].id);
    expect(savedInterest[0].propertyId).toEqual(propertyResult[0].id);
    expect(savedInterest[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when client interest not found', async () => {
    const updateInput: UpdateClientInterestInput = {
      id: 999,
      interestLevel: 'High'
    };

    await expect(updateClientInterest(updateInput))
      .rejects.toThrow(/ClientInterest with id 999 not found/i);
  });

  it('should update only interest level when provided', async () => {
    // Create prerequisite data
    const clientResult = await db.insert(clientsTable)
      .values({
        firstName: testClient.firstName,
        lastName: testClient.lastName,
        email: testClient.email,
        phone: testClient.phone,
        budget: testClient.budget?.toString(),
        desiredPropertyType: testClient.desiredPropertyType
      })
      .returning()
      .execute();

    const propertyResult = await db.insert(propertiesTable)
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

    // Create client interest
    const interestResult = await db.insert(clientInterestsTable)
      .values({
        clientId: clientResult[0].id,
        propertyId: propertyResult[0].id,
        interestLevel: 'Low'
      })
      .returning()
      .execute();

    const originalCreatedAt = interestResult[0].created_at;

    const updateInput: UpdateClientInterestInput = {
      id: interestResult[0].id,
      interestLevel: 'Medium'
    };

    const result = await updateClientInterest(updateInput);

    // Verify only interest level changed, other fields remain unchanged
    expect(result.interestLevel).toEqual('Medium');
    expect(result.clientId).toEqual(clientResult[0].id);
    expect(result.propertyId).toEqual(propertyResult[0].id);
    expect(result.created_at).toEqual(originalCreatedAt);
  });
});
