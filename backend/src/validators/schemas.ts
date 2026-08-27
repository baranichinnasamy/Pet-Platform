import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().optional(),
  roles: z.array(z.string()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  profileImage: z.string().url().optional(),
});

export const createPetSchema = z.object({
  name: z.string().min(1).max(100),
  species: z.string().min(1),
  breed: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']).optional(),
  dateOfBirth: z.string().datetime().optional(),
  color: z.string().optional(),
  weight: z.number().positive().optional(),
  description: z.string().optional(),
  healthStatus: z.string().optional(),
  profileImage: z.string().url().optional(),
});

export const updatePetSchema = createPetSchema.partial().extend({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SOLD', 'DECEASED']).optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
});
