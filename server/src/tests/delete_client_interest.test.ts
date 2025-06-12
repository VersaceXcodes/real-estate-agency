
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { clientsTable, propertiesTable, clientInterestsTable } from '../db/schema';
import { type DeleteInput, type CreateClientInput, type CreatePropertyInput, type CreateClientInterestInput } from '../schema';
import { deleteClientInterest } from '../handlers/delete_client_interest';
import { eq } from 'drizzle-orm';

// Test data
const testClient: CreateClientInput = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '555-0123',
  budget: 250000.00,
  desiredPropertyType: 'House'
};

const testProperty: CreatePropertyInput = {
  address: '123 Main St',
  price: 200000.00,
  bedrooms: 3,
  bathrooms: 2,
  squareFootage: 1500.00,
  type: 'House',
  status: 'Available',
  description: 'Nice house'
};

describe('deleteClientInterest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a client interest successfully', async () => {
    // Create prerequisite client
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

    // Create prerequisite property
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
    const clientInterestInput: CreateClientInterestInput = {
      clientId: clientResult[0].id,
      propertyId: propertyResult[0].id,
      interestLevel: 'High'
    };

    const interestResult = await db.insert(clientInterestsTable)
      .values({
        clientId: clientInterestInput.clientId,
        propertyId: clientInterestInput.propertyId,
        interestLevel: clientInterestInput.interestLevel
      })
      .returning()
      .execute();

    const deleteInput: DeleteInput = {
      id: interestResult[0].id
    };

    const result = await deleteClientInterest(deleteInput);

    expect(result.success).toBe(true);

    // Verify deletion from database
    const deletedInterests = await db.select()
      .from(clientInterestsTable)
      .where(eq(clientInterestsTable.id, deleteInput.id))
      .execute();

    expect(deletedInterests).toHaveLength(0);
  });

  it('should return false when client interest does not exist', async () => {
    const deleteInput: DeleteInput = {
      id: 999
    };

    const result = await deleteClientInterest(deleteInput);

    expect(result.success).toBe(false);
  });

  it('should not affect other client interests when deleting one', async () => {
    // Create prerequisite client
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

    // Create prerequisite property
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

    // Create two client interests
    const interest1Result = await db.insert(clientInterestsTable)
      .values({
        clientId: clientResult[0].id,
        propertyId: propertyResult[0].id,
        interestLevel: 'High'
      })
      .returning()
      .execute();

    const interest2Result = await db.insert(clientInterestsTable)
      .values({
        clientId: clientResult[0].id,
        propertyId: propertyResult[0].id,
        interestLevel: 'Medium'
      })
      .returning()
      .execute();

    // Delete the first interest
    const deleteInput: DeleteInput = {
      id: interest1Result[0].id
    };

    const result = await deleteClientInterest(deleteInput);

    expect(result.success).toBe(true);

    // Verify first interest is deleted
    const deletedInterests = await db.select()
      .from(clientInterestsTable)
      .where(eq(clientInterestsTable.id, interest1Result[0].id))
      .execute();

    expect(deletedInterests).toHaveLength(0);

    // Verify second interest still exists
    const remainingInterests = await db.select()
      .from(clientInterestsTable)
      .where(eq(clientInterestsTable.id, interest2Result[0].id))
      .execute();

    expect(remainingInterests).toHaveLength(1);
    expect(remainingInterests[0].interestLevel).toBe('Medium');
  });
});
