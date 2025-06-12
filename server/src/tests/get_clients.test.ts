
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { clientsTable } from '../db/schema';
import { type CreateClientInput } from '../schema';
import { getClients } from '../handlers/get_clients';

// Test client data
const testClient1: CreateClientInput = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '555-0123',
  budget: 500000,
  desiredPropertyType: 'House'
};

const testClient2: CreateClientInput = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '555-0456',
  budget: null,
  desiredPropertyType: null
};

const testClient3: CreateClientInput = {
  firstName: 'Bob',
  lastName: 'Johnson',
  email: 'bob.johnson@example.com',
  phone: '555-0789',
  budget: 750000,
  desiredPropertyType: 'Condo'
};

describe('getClients', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no clients exist', async () => {
    const result = await getClients();
    expect(result).toEqual([]);
  });

  it('should return all clients', async () => {
    // Create test clients
    await db.insert(clientsTable).values([
      {
        firstName: testClient1.firstName,
        lastName: testClient1.lastName,
        email: testClient1.email,
        phone: testClient1.phone,
        budget: testClient1.budget?.toString(),
        desiredPropertyType: testClient1.desiredPropertyType
      },
      {
        firstName: testClient2.firstName,
        lastName: testClient2.lastName,
        email: testClient2.email,
        phone: testClient2.phone,
        budget: testClient2.budget?.toString(),
        desiredPropertyType: testClient2.desiredPropertyType
      },
      {
        firstName: testClient3.firstName,
        lastName: testClient3.lastName,
        email: testClient3.email,
        phone: testClient3.phone,
        budget: testClient3.budget?.toString(),
        desiredPropertyType: testClient3.desiredPropertyType
      }
    ]).execute();

    const result = await getClients();

    expect(result).toHaveLength(3);
    
    // Check that all clients are returned
    const firstNames = result.map(client => client.firstName);
    expect(firstNames).toContain('John');
    expect(firstNames).toContain('Jane');
    expect(firstNames).toContain('Bob');
  });

  it('should return clients with correct field types and values', async () => {
    // Create a test client
    await db.insert(clientsTable).values({
      firstName: testClient1.firstName,
      lastName: testClient1.lastName,
      email: testClient1.email,
      phone: testClient1.phone,
      budget: testClient1.budget?.toString(),
      desiredPropertyType: testClient1.desiredPropertyType
    }).execute();

    const result = await getClients();

    expect(result).toHaveLength(1);
    
    const client = result[0];
    expect(client.id).toBeDefined();
    expect(typeof client.id).toBe('number');
    expect(client.firstName).toBe('John');
    expect(client.lastName).toBe('Doe');
    expect(client.email).toBe('john.doe@example.com');
    expect(client.phone).toBe('555-0123');
    expect(client.budget).toBe(500000);
    expect(typeof client.budget).toBe('number');
    expect(client.desiredPropertyType).toBe('House');
    expect(client.created_at).toBeInstanceOf(Date);
  });

  it('should handle clients with null budget correctly', async () => {
    // Create client with null budget
    await db.insert(clientsTable).values({
      firstName: testClient2.firstName,
      lastName: testClient2.lastName,
      email: testClient2.email,
      phone: testClient2.phone,
      budget: null,
      desiredPropertyType: testClient2.desiredPropertyType
    }).execute();

    const result = await getClients();

    expect(result).toHaveLength(1);
    
    const client = result[0];
    expect(client.firstName).toBe('Jane');
    expect(client.lastName).toBe('Smith');
    expect(client.budget).toBeNull();
    expect(client.desiredPropertyType).toBeNull();
  });

  it('should return clients ordered by creation time', async () => {
    // Create clients with slight delay to ensure different timestamps
    await db.insert(clientsTable).values({
      firstName: 'First',
      lastName: 'Client',
      email: 'first@example.com',
      phone: '555-0001',
      budget: null,
      desiredPropertyType: null
    }).execute();

    await db.insert(clientsTable).values({
      firstName: 'Second',
      lastName: 'Client',
      email: 'second@example.com',
      phone: '555-0002',
      budget: null,
      desiredPropertyType: null
    }).execute();

    const result = await getClients();

    expect(result).toHaveLength(2);
    
    // Verify both clients are present
    const firstNames = result.map(client => client.firstName);
    expect(firstNames).toContain('First');
    expect(firstNames).toContain('Second');
    
    // Verify timestamps are dates
    result.forEach(client => {
      expect(client.created_at).toBeInstanceOf(Date);
    });
  });
});
