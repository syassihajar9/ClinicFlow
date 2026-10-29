
const { z } = require('zod');

const uuidSchema = z.string().uuid('Identifiant UUID invalide.');

const fullNameSchema = z.string()
  .trim()
  .min(2, 'Le nom doit contenir au moins 2 caractères.')
  .max(100, 'Le nom ne doit pas dépasser 100 caractères.');

const emailSchema = z.string()
  .trim()
  .email('Adresse e-mail invalide.')
  .max(254, 'Adresse e-mail trop longue.')
  .transform((value) => value.toLowerCase());

const roleSchema = z.enum(['admin', 'staff'], {
  error: 'Le rôle doit être admin ou staff.',
});

const passwordSchema = z.string()
  .min(12, 'Le mot de passe doit contenir au moins 12 caractères.')
  .max(72, 'Le mot de passe est trop long.');

const requestSchema = (body, params = {}, query = {}) =>
  z.object({
    body: body.optional().default({}),
    params: z.object(params),
    query: z.object(query),
  });

const createUserSchema = requestSchema(
  z.object({
    full_name: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    role: roleSchema,
  }).strict()
);

const updateUserSchema = requestSchema(
  z.object({
    full_name: fullNameSchema.optional(),
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
    role: roleSchema.optional(),
  })
    .strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      'Au moins un champ doit être fourni.'
    ),
  { id: uuidSchema }
);

const getUserSchema = requestSchema(
  z.object({}),
  { id: uuidSchema }
);

const listUsersSchema = requestSchema(
  z.object({}),
  {},
  {
    search: z.string().trim().max(100).optional(),
    page: z.string().regex(/^[1-9]\d*$/).optional(),
    limit: z.string().regex(/^[1-9]\d*$/).optional(),
  }
).superRefine((data, ctx) => {
  if (data.query.limit && Number(data.query.limit) > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['query', 'limit'],
      message: 'La limite maximale est de 100.',
    });
  }
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  listUsersSchema,
};
