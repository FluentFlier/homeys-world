import { z } from 'zod'

export const listingSchema = z.object({
  type: z.enum(['room_available', 'apartment_available', 'looking_for_room', 'looking_for_roommate']),
  title: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').optional(),
  monthly_rent: z.number().min(0).nullable().optional(),
  move_in_date: z.string().nullable().optional(),
  move_out_date: z.string().nullable().optional(),
  bedrooms: z.number().min(0).max(10).nullable().optional(),
  bathrooms: z.number().min(0).max(10).nullable().optional(),
  neighborhood: z.string().nullable().optional(),
  amenities: z.array(z.string()).default([]),
  poster_first_name: z.string().min(1, 'First name is required'),
  contact_email: z.string().email('Invalid email address'),
  contact_phone: z.string().nullable().optional(),
  contact_social: z.string().nullable().optional(),
})

export type ListingFormValues = z.infer<typeof listingSchema>

export const profileSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  bio: z.string().max(1000, 'Bio is too long').optional(),
  age_range: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  occupation: z.string().nullable().optional(),
  budget_min: z.number().min(0).nullable().optional(),
  budget_max: z.number().min(0).nullable().optional(),
  move_in_date: z.string().nullable().optional(),
  lifestyle: z.array(z.string()).default([]),
  hobbies: z.array(z.string()).default([]),
  contact_email: z.string().email().nullable().optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
