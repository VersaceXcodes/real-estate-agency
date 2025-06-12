
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { clientsTable } from '../db/schema';
import { type CreateClientInput, type UpdateClientInput } from '../schema';
import { updateClient } from '../handlers/update_client';
import { eq } from 'drizzle-orm';

// Test data
const testClient: CreateClientInput = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890',
  budget: 500000,
  desiredPropertyType: 'House'
};

const createTestClient = async () => {
  const result = await db.insert(clientsTable)
    .values({
      firstName: testClient.firstName,
      lastName: testClient.lastName,
      email: testClient.email,
      phone: testClient.phone,
      budget: testClient.budget?.toString() ?? null,
      desiredPropertyType: testClient.desiredPropertyType
    })
    .returning()
    .execute();

  return {
    ...result[0],
    budget: result[0].budget ? parseFloat(result[0].budget) : null
  };
};

describe('updateClient', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update client with all fields', async () => {
    const client = await createTestClient();

    const updateInput: UpdateClientInput = {
      id: client.id,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '987-654-3210',
      budget: 750000,
      desiredPropertyType: 'Apartment'
    };

    const result = await updateClient(updateInput);

    // Verify all fields were updated
    expect(result.id).toEqual(client.id);
    expect(result.firstName).toEqual('Jane');
    expect(result.lastName).toEqual('Smith');
    expect(result.email).toEqual('jane.smith@example.com');
    expect(result.phone).toEqual('987-654-3210');
    expect(result.budget).toEqual(750000);
    expect(typeof result.budget).toBe('number');
    expect(result.desiredPropertyType).toEqual('Apartment');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update client with partial fields', async () => {
    const client = await createTestClient();

    const updateInput: UpdateClientInput = {
      id: client.id,
      firstName: 'Jane',
      budget: 600000
    };

    const result = await updateClient(updateInput);

    // Verify only specified fields were updated
    expect(result.id).toEqual(client.id);
    expect(result.firstName).toEqual('Jane');
    expect(result.lastName).toEqual('Doe'); // Unchanged
    expect(result.email).toEqual('john.doe@example.com'); // Unchanged
    expect(result.phone).toEqual('123-456-7890'); // Unchanged
    expect(result.budget).toEqual(600000); // Updated
    expect(typeof result.budget).toBe('number');
    expect(result.desiredPropertyType).toEqual('House'); // Unchanged
  });

  it('should handle null budget update', async () => {
    const client = await createTestClient();

    const updateInput: UpdateClientInput = {
      id: client.id,
      budget: null
    };

    const result = await updateClient(updateInput);

    expect(result.id).toEqual(client.id);
    expect(result.budget).toBeNull();
    expect(result.firstName).toEqual('John'); // Unchanged
  });

  it('should handle null desiredPropertyType update', async () => {
    const client = await createTestClient();

    const updateInput: UpdateClientInput = {
      id: client.id,
      desiredPropertyType: null
    };

    const result = await updateClient(updateInput);

    expect(result.id).toEqual(client.id);
    expect(result.desiredPropertyType).toBeNull();
    expect(result.firstName).toEqual('John'); // Unchanged
  });

  it('should save changes to database', async () => {
    const client = await createTestClient();

    const updateInput: UpdateClientInput = {
      id: client.id,
      firstName: 'Updated Name',
      budget: 800000
    };

    await updateClient(updateInput);

    // Verify changes were persisted
    const savedClients = await db.select()
      .from(clientsTable)
      .where(eq(clientsTable.id, client.id))
      .execute();

    expect(savedClients).toHaveLength(1);
    expect(savedClients[0].firstName).toEqual('Updated Name');
    expect(parseFloat(savedClients[0].budget!)).toEqual(800000);
    expect(savedClients[0].lastName).toEqual('Doe'); // Unchanged
  });

  it('should throw error for non-existent client', async () => {
    const updateInput: UpdateClientInput = {
      id: 999,
      firstName: 'Test'
    };

    await expect(updateClient(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should update only email field', async () => {
    const client = await createTestClient();

    const updateInput: UpdateClientInput = {
      id: client.id,
      email: 'newemail@example.com'
    };

    const result = await updateClient(updateInput);

    expect(result.email).toEqual('newemail@example.com');
    expect(result.firstName).toEqual('John'); // Unchanged
    expect(result.lastName).toEqual('Doe'); // Unchanged
    expect(result.phone).toEqual('123-456-7890'); // Unchanged
    expect(result.budget).toEqual(500000); // Unchanged
  });
});
