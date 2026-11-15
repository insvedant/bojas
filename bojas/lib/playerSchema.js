import { z } from 'zod';

const optionalInt = (min, max) =>
  z.preprocess((v) => (v === '' || v === null || v === undefined ? null : Number(v)), z.number().int().min(min).max(max).nullable());

const str = (max) => z.string().trim().max(max).default('');

export const playerInput = z.object({
  name: z.string().trim().min(2, 'Enter the player’s full name').max(80),
  slug: z.string().trim().max(80).optional().default(''),
  number: optionalInt(0, 99),
  position: str(60),
  age: optionalInt(5, 60),
  nationality: str(60),
  foot: z.enum(['Left', 'Right', 'Both', '']).default(''),
  height: str(20),
  weight: str(20),
  club: str(80),
  status: str(40),
  bio: str(2000),
  highlights: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === '' || /^https?:\/\//i.test(v), 'Highlights must be a full link starting with https://')
    .default(''),
  strengths: z.array(z.string().trim().min(1).max(60)).max(12).default([]),
  ratings: z
    .array(z.object({ label: z.string().trim().min(1).max(40), value: z.coerce.number().int().min(1).max(10) }))
    .max(20)
    .default([]),
  photoId: z.string().regex(/^[a-f0-9]{24}$/i).nullable().optional().default(null),
  published: z.boolean().default(true),
  order: z.coerce.number().int().min(0).max(9999).default(0),
});

export function formatZodError(err) {
  const first = err.issues[0];
  const field = first.path.join('.');
  return field ? `${field}: ${first.message}` : first.message;
}
