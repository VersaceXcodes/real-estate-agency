
import { z } from 'zod';

// Property schemas
export const propertySchema = z.object({
  id: z.number(),
  address: z.string(),
  price: z.number(),
  bedrooms: z.number().int(),
  bathrooms: z.number().int(),
  squareFootage: z.number(),
  type: z.enum(['House', 'Apartment', 'Condo']),
  status: z.enum(['Available', 'Under Contract', 'Sold']),
  description: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Property = z.infer<typeof propertySchema>;

export const createPropertyInputSchema = z.object({
  address: z.string(),
  price: z.number().positive(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().nonnegative(),
  squareFootage: z.number().positive(),
  type: z.enum(['House', 'Apartment', 'Condo']),
  status: z.enum(['Available', 'Under Contract', 'Sold']),
  description: z.string().nullable()
});

export type CreatePropertyInput = z.infer<typeof createPropertyInputSchema>;

export const updatePropertyInputSchema = z.object({
  id: z.number(),
  address: z.string().optional(),
  price: z.number().positive().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  squareFootage: z.number().positive().optional(),
  type: z.enum(['House', 'Apartment', 'Condo']).optional(),
  status: z.enum(['Available', 'Under Contract', 'Sold']).optional(),
  description: z.string().nullable().optional()
});

export type UpdatePropertyInput = z.infer<typeof updatePropertyInputSchema>;

// Client schemas
export const clientSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
  budget: z.number().nullable(),
  desiredPropertyType: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Client = z.infer<typeof clientSchema>;

export const createClientInputSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  budget: z.number().positive().nullable(),
  desiredPropertyType: z.string().nullable()
});

export type CreateClientInput = z.infer<typeof createClientInputSchema>;

export const updateClientInputSchema = z.object({
  id: z.number(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  budget: z.number().positive().nullable().optional(),
  desiredPropertyType: z.string().nullable().optional()
});

export type UpdateClientInput = z.infer<typeof updateClientInputSchema>;

// ClientInterest schemas
export const clientInterestSchema = z.object({
  id: z.number(),
  clientId: z.number(),
  propertyId: z.number(),
  interestLevel: z.enum(['High', 'Medium', 'Low']),
  created_at: z.coerce.date()
});

export type ClientInterest = z.infer<typeof clientInterestSchema>;

export const createClientInterestInputSchema = z.object({
  clientId: z.number(),
  propertyId: z.number(),
  interestLevel: z.enum(['High', 'Medium', 'Low'])
});

export type CreateClientInterestInput = z.infer<typeof createClientInterestInputSchema>;

export const updateClientInterestInputSchema = z.object({
  id: z.number(),
  interestLevel: z.enum(['High', 'Medium', 'Low']).optional()
});

export type UpdateClientInterestInput = z.infer<typeof updateClientInterestInputSchema>;

// Additional schemas for queries
export const deleteInputSchema = z.object({
  id: z.number()
});

export type DeleteInput = z.infer<typeof deleteInputSchema>;

export const getByIdInputSchema = z.object({
  id: z.number()
});

export type GetByIdInput = z.infer<typeof getByIdInputSchema>;
