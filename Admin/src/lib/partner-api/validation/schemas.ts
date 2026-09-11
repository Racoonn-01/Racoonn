import { z } from 'zod';

export const AvailabilityUpdateSchema = z.object({
  propertyId: z.string().optional(),
  roomId: z.string().min(1, 'roomId is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  available: z.number().int().min(0, 'available count cannot be negative'),
  blocked: z.boolean().optional(),
  price: z.number().positive().optional(),
});

export const BulkAvailabilitySchema = z.object({
  propertyId: z.string().optional(),
  updates: z.array(AvailabilityUpdateSchema).min(1, 'At least one update is required'),
});

export const RateUpdateSchema = z.object({
  propertyId: z.string().optional(),
  roomId: z.string().min(1, 'roomId is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  price: z.number().positive('price must be positive'),
  currency: z.string().default('INR'),
});

export const BulkRateSchema = z.object({
  propertyId: z.string().optional(),
  updates: z.array(RateUpdateSchema).min(1, 'At least one rate update is required'),
});

export const CreateReservationSchema = z.object({
  propertyId: z.string().min(1, 'propertyId is required'),
  roomId: z.string().min(1, 'roomId is required'),
  externalReference: z.string().optional(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'checkIn must be YYYY-MM-DD'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'checkOut must be YYYY-MM-DD'),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  guest: z.object({
    firstName: z.string().min(1, 'guest.firstName is required'),
    lastName: z.string().min(1, 'guest.lastName is required'),
    email: z.string().email('valid guest.email is required'),
    phone: z.string().optional(),
    country: z.string().optional(),
  }),
  totalAmount: z.number().positive().optional(),
  currency: z.string().default('INR'),
  specialRequests: z.string().optional(),
});

export const CancelReservationSchema = z.object({
  reason: z.string().optional().default('Cancelled by external PMS'),
  externalReference: z.string().optional(),
});

export const WebhookEndpointCreateSchema = z.object({
  url: z.string().url('A valid webhook URL is required'),
  events: z.array(
    z.enum([
      'reservation.created',
      'reservation.updated',
      'reservation.cancelled',
      'availability.updated',
      'rate.updated',
      'property.updated',
      'room.updated',
    ])
  ).min(1, 'Select at least one event'),
});
