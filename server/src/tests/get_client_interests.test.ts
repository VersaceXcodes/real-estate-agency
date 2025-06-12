
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { clientsTable, propertiesTable, clientInterestsTable } from '../db/schema';
import { getClientInterests } from '../handlers/get_client_interests';

describe('getClientInterests', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no client interests exist', async () => {
    const result = await getClientInterests();
    expect(result).toEqual([]);
  });

  it('should return all client interests', async () => {
    // Create test client
    const clientResult = await db.insert(clientsTable)
      .values({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        budget: '500000.00',
        desiredPropertyType: 'House'
      })
      .returning()
      .execute();

    // Create test property
    const propertyResult = await db.insert(propertiesTable)
      .values({
        address: '123 Main St',
        price: '450000.00',
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: '1800.00',
        type: 'House',
        status: 'Available',
        description: 'Nice house'
      })
      .returning()
      .execute();

    // Create test client interest
    await db.insert(clientInterestsTable)
      .values({
        clientId: clientResult[0].id,
        propertyId: propertyResult[0].id,
        interestLevel: 'High'
      })
      .execute();

    const result = await getClientInterests();

    expect(result).toHaveLength(1);
    expect(result[0].clientId).toEqual(clientResult[0].id);
    expect(result[0].propertyId).toEqual(propertyResult[0].id);
    expect(result[0].interestLevel).toEqual('High');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return multiple client interests', async () => {
    // Create test clients
    const client1 = await db.insert(clientsTable)
      .values({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        budget: '500000.00',
        desiredPropertyType: 'House'
      })
      .returning()
      .execute();

    const client2 = await db.insert(clientsTable)
      .values({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '987-654-3210',
        budget: '400000.00',
        desiredPropertyType: 'Condo'
      })
      .returning()
      .execute();

    // Create test properties
    const property1 = await db.insert(propertiesTable)
      .values({
        address: '123 Main St',
        price: '450000.00',
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: '1800.00',
        type: 'House',
        status: 'Available',
        description: 'Nice house'
      })
      .returning()
      .execute();

    const property2 = await db.insert(propertiesTable)
      .values({
        address: '456 Oak Ave',
        price: '350000.00',
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: '1200.00',
        type: 'Condo',
        status: 'Available',
        description: 'Modern condo'
      })
      .returning()
      .execute();

    // Create multiple client interests
    await db.insert(clientInterestsTable)
      .values([
        {
          clientId: client1[0].id,
          propertyId: property1[0].id,
          interestLevel: 'High'
        },
        {
          clientId: client2[0].id,
          propertyId: property2[0].id,
          interestLevel: 'Medium'
        },
        {
          clientId: client1[0].id,
          propertyId: property2[0].id,
          interestLevel: 'Low'
        }
      ])
      .execute();

    const result = await getClientInterests();

    expect(result).toHaveLength(3);
    
    // Check that all interests are returned
    const interestLevels = result.map(r => r.interestLevel).sort();
    expect(interestLevels).toEqual(['High', 'Low', 'Medium']);
    
    // Verify all required fields are present
    result.forEach(interest => {
      expect(interest.id).toBeDefined();
      expect(interest.clientId).toBeDefined();
      expect(interest.propertyId).toBeDefined();
      expect(interest.interestLevel).toBeDefined();
      expect(interest.created_at).toBeInstanceOf(Date);
    });
  });
});
