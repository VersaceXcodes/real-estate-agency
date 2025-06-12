
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { clientsTable, clientInterestsTable, propertiesTable } from '../db/schema';
import { type DeleteInput, type CreateClientInput } from '../schema';
import { deleteClient } from '../handlers/delete_client';
import { eq } from 'drizzle-orm';

// Test input for creating a client to delete
const testClientInput: CreateClientInput = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '555-0123',
  budget: 250000,
  desiredPropertyType: 'House'
};

describe('deleteClient', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing client', async () => {
    // Create a client first
    const createdClient = await db.insert(clientsTable)
      .values({
        firstName: testClientInput.firstName,
        lastName: testClientInput.lastName,
        email: testClientInput.email,
        phone: testClientInput.phone,
        budget: testClientInput.budget?.toString(),
        desiredPropertyType: testClientInput.desiredPropertyType
      })
      .returning()
      .execute();

    const clientId = createdClient[0].id;
    const deleteInput: DeleteInput = { id: clientId };

    // Delete the client
    const result = await deleteClient(deleteInput);

    // Verify deletion was successful
    expect(result.success).toBe(true);

    // Verify client no longer exists in database
    const clients = await db.select()
      .from(clientsTable)
      .where(eq(clientsTable.id, clientId))
      .execute();

    expect(clients).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent client', async () => {
    const deleteInput: DeleteInput = { id: 999 };

    // Try to delete non-existent client
    const result = await deleteClient(deleteInput);

    expect(result.success).toBe(false);
  });

  it('should handle cascading deletion of client interests', async () => {
    // Create a client
    const createdClient = await db.insert(clientsTable)
      .values({
        firstName: testClientInput.firstName,
        lastName: testClientInput.lastName,
        email: testClientInput.email,
        phone: testClientInput.phone,
        budget: testClientInput.budget?.toString(),
        desiredPropertyType: testClientInput.desiredPropertyType
      })
      .returning()
      .execute();

    const clientId = createdClient[0].id;

    // Create a property first (required for client interest)
    const createdProperty = await db.insert(propertiesTable)
      .values({
        address: '123 Test St',
        price: '300000',
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: '1500',
        type: 'House',
        status: 'Available'
      })
      .returning()
      .execute();

    const propertyId = createdProperty[0].id;

    // Create a client interest
    await db.insert(clientInterestsTable)
      .values({
        clientId: clientId,
        propertyId: propertyId,
        interestLevel: 'High'
      })
      .execute();

    const deleteInput: DeleteInput = { id: clientId };

    // Delete the client (should cascade to client interests)
    const result = await deleteClient(deleteInput);

    expect(result.success).toBe(true);

    // Verify client is deleted
    const clients = await db.select()
      .from(clientsTable)
      .where(eq(clientsTable.id, clientId))
      .execute();

    expect(clients).toHaveLength(0);

    // Verify client interests were also deleted due to cascade
    const interests = await db.select()
      .from(clientInterestsTable)
      .where(eq(clientInterestsTable.clientId, clientId))
      .execute();

    expect(interests).toHaveLength(0);
  });
});
