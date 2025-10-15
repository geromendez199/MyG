import { z } from "zod";

export const vehicleInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  priceARS: z.coerce.number().int().positive().optional().or(z.literal("")),
  km: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  fuel: z.string().optional(),
  gearbox: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string().url()).default([]),
  sellerId: z.string().min(1),
  published: z.coerce.boolean().optional().default(true),
});

export type VehicleInput = z.infer<typeof vehicleInputSchema>;

export const vehicleFiltersSchema = z.object({
  q: z.string().optional(),
  brand: z.string().optional(),
  yearMin: z.coerce.number().optional(),
  yearMax: z.coerce.number().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(12),
});

export type VehicleFilters = z.infer<typeof vehicleFiltersSchema>;
