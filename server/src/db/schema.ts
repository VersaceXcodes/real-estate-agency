
import { serial, text, pgTable, timestamp, numeric, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const propertyTypeEnum = pgEnum('property_type', ['House', 'Apartment', 'Condo']);
export const propertyStatusEnum = pgEnum('property_status', ['Available', 'Under Contract', 'Sold']);
export const interestLevelEnum = pgEnum('interest_level', ['High', 'Medium', 'Low']);

// Properties table
export const propertiesTable = pgTable('properties', {
  id: serial('id').primaryKey(),
  address: text('address').notNull(),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  bedrooms: integer('bedrooms').notNull(),
  bathrooms: integer('bathrooms').notNull(),
  squareFootage: numeric('square_footage', { precision: 10, scale: 2 }).notNull(),
  type: propertyTypeEnum('type').notNull(),
  status: propertyStatusEnum('status').notNull(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Clients table
export const clientsTable = pgTable('clients', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  budget: numeric('budget', { precision: 12, scale: 2 }),
  desiredPropertyType: text('desired_property_type'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// ClientInterests table (junction table for many-to-many relationship)
export const clientInterestsTable = pgTable('client_interests', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clientsTable.id, { onDelete: 'cascade' }),
  propertyId: integer('property_id').notNull().references(() => propertiesTable.id, { onDelete: 'cascade' }),
  interestLevel: interestLevelEnum('interest_level').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const propertiesRelations = relations(propertiesTable, ({ many }) => ({
  clientInterests: many(clientInterestsTable),
}));

export const clientsRelations = relations(clientsTable, ({ many }) => ({
  clientInterests: many(clientInterestsTable),
}));

export const clientInterestsRelations = relations(clientInterestsTable, ({ one }) => ({
  client: one(clientsTable, {
    fields: [clientInterestsTable.clientId],
    references: [clientsTable.id],
  }),
  property: one(propertiesTable, {
    fields: [clientInterestsTable.propertyId],
    references: [propertiesTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Property = typeof propertiesTable.$inferSelect;
export type NewProperty = typeof propertiesTable.$inferInsert;
export type Client = typeof clientsTable.$inferSelect;
export type NewClient = typeof clientsTable.$inferInsert;
export type ClientInterest = typeof clientInterestsTable.$inferSelect;
export type NewClientInterest = typeof clientInterestsTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  properties: propertiesTable,
  clients: clientsTable,
  clientInterests: clientInterestsTable,
};
