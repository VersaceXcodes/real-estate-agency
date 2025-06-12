
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { clientsTable } from '../db/schema';
import { type CreateClientInput } from '../schema';
import { createClient } from '../handlers/create_client';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateClientInput = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '555-0123',
  budget: 500000,
  desiredPropertyType: 'House'
};

// Test input with nullable fields as null
const testInputWithNulls: CreateClientInput = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '555-0456',
  budget: null,
  desiredPropertyType: null
};

describe('createClient', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a client with all fields', async () => {
    const result = await createClient(testInput);

    // Basic field validation
    expect(result.firstName).toEqual('John');
    expect(result.lastName).toEqual('Doe');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.phone).toEqual('555-0123');
    expect(result.budget).toEqual(500000);
    expect(typeof result.budget).toEqual('number');
    expect(result.desiredPropertyType).toEqual('House');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a client with nullable fields as null', async () => {
    const result = await createClient(testInputWithNulls);

    // Basic field validation
    expect(result.firstName).toEqual('Jane');
    expect(result.lastName).toEqual('Smith');
    expect(result.email).toEqual('jane.smith@example.com');
    expect(result.phone).toEqual('555-0456');
    expect(result.budget).toBeNull();
    expect(result.desiredPropertyType).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save client to database', async () => {
    const result = await createClient(testInput);

    // Query using proper drizzle syntax
    const clients = await db.select()
      .from(clientsTable)
      .where(eq(clientsTable.id, result.id))
      .execute();

    expect(clients).toHaveLength(1);
    expect(clients[0].firstName).toEqual('John');
    expect(clients[0].lastName).toEqual('Doe');
    expect(clients[0].email).toEqual('john.doe@example.com');
    expect(clients[0].phone).toEqual('555-0123');
    expect(parseFloat(clients[0].budget!)).toEqual(500000);
    expect(clients[0].desiredPropertyType).toEqual('House');
    expect(clients[0].created_at).toBeInstanceOf(Date);
  });

  it('should save client with null values to database', async () => {
    const result = await createClient(testInputWithNulls);

    // Query using proper drizzle syntax
    const clients = await db.select()
      .from(clientsTable)
      .where(eq(clientsTable.id, result.id))
      .execute();

    expect(clients).toHaveLength(1);
    expect(clients[0].firstName).toEqual('Jane');
    expect(clients[0].lastName).toEqual('Smith');
    expect(clients[0].email).toEqual('jane.smith@example.com');
    expect(clients[0].phone).toEqual('555-0456');
    expect(clients[0].budget).toBeNull();
    expect(clients[0].desiredPropertyType).toBeNull();
    expect(clients[0].created_at).toBeInstanceOf(Date);
  });
});
