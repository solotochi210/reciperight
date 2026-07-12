import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const ingredientSchema = z.object({
  name: z.string().trim().min(1, 'Ingredient name is required'),
  quantity: z.string().trim().optional().default(''),
  unit: z.string().trim().optional().default(''),
  notes: z.string().trim().optional().default(''),
});

const stepSchema = z.object({
  order: z.number().int().optional(),
  instruction: z.string().trim().min(1, 'Step instruction is required'),
  image: z
    .object({ url: z.string().optional().default(''), publicId: z.string().optional().default('') })
    .optional(),
  duration: z.coerce.number().min(0).optional().default(0),
});

export const recipeSchema = z.object({
  title: z.string().trim().min(3, 'Title must be 3-100 characters').max(100),
  description: z.string().trim().max(500, 'Description must be 500 characters or fewer').optional().default(''),
  coverImage: z
    .object({ url: z.string().optional().default(''), publicId: z.string().optional().default('') })
    .optional(),
  cuisine: z.string().trim().optional().default(''),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Easy'),
  prepTime: z.coerce.number().int().min(0).default(0),
  cookTime: z.coerce.number().int().min(0).default(0),
  servings: z.coerce.number().int().min(1).default(1),
  tags: z.array(z.string().trim()).max(10, 'Up to 10 tags').default([]),
  ingredients: z.array(ingredientSchema).min(1, 'Add at least one ingredient'),
  steps: z.array(stepSchema).min(1, 'Add at least one step'),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  bio: z.string().trim().max(280, 'Bio must be 280 characters or fewer').optional().default(''),
});
