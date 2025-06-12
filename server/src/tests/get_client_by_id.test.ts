
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { clientsTable } from '../db/schema';
import { type GetByIdInput, type CreateClientInput } from '../schema';
import { getClientById } from '../handlers/get_client_by_id';

// Test input for client creation
const testClientInput: CreateClientInput = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '555-1234',
  budget: 500000,
  desiredPropertyType: 'House'
};

describe('getClientById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should get client by id', async () => {
    // Create test client
    const createResult = await db.insert(clientsTable)
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

    const createdClient = createResult[0];
    const input: GetByIdInput = { id: createdClient.id };

    const result = await getClientById(input);

    expect(result.id).toEqual(createdClient.id);
    expect(result.firstName).toEqual('John');
    expect(result.lastName).toEqual('Doe');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.phone).toEqual('555-1234');
    expect(result.budget).toEqual(500000);
    expect(typeof result.budget).toBe('number');
    expect(result.desiredPropertyType).toEqual('House');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should handle client with null budget', async () => {
    // Create client with null budget
    const createResult = await db.insert(clientsTable)
      .values({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '555-5678',
        budget: null,
        desiredPropertyType: null
      })
      .returning()
      .execute();

    const createdClient = createResult[0];
    const input: GetByIdInput = { id: createdClient.id };

    const result = await getClientById(input);

    expect(result.id).toEqual(createdClient.id);
    expect(result.firstName).toEqual('Jane');
    expect(result.lastName).toEqual('Smith');
    expect(result.budget).toBeNull();
    expect(result.desiredPropertyType).toBeNull();
  });

  it('should throw error when client not found', async () => {
    const input: GetByIdInput = { id: 999 };

    expect(getClientById(input)).rejects.toThrow(/client with id 999 not found/i);
  });
});
