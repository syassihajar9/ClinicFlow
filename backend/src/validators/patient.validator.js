
const { z } = require('zod');

const uuidSchema = z.string().uuid('Identifiant UUID invalide.');

const patientFields = {
  full_name: z.string()
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères.')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères.'),

  cin: z.string()
    .trim()
    .min(1, 'Le CIN est obligatoire.')
    .max(30, 'Le CIN ne doit pas dépasser 30 caractères.'),

  phone: z.string()
    .trim()
    .min(1, 'Le téléphone est obligatoire.')
    .max(20, 'Le téléphone ne doit pas dépasser 20 caractères.'),

  birth_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date au format AAAA-MM-JJ.')
    .refine((value) => {
      const date = new Date(`${value}T00:00:00Z`);

      return !Number.isNaN(date.getTime())
        && date.toISOString().slice(0, 10) === value;
    }, 'La date de naissance est invalide.')
    .refine(
      (value) => value <= new Date().toISOString().slice(0, 10),
      'La date de naissance ne peut pas être dans le futur.'
    ),

  address: z.string()
    .trim()
    .max(500, 'Adresse limitée à 500 caractères.')
    .optional(),
};

// Permet les requêtes GET sans corps JSON.
const requestSchema = (body, params = {}, query = {}) => z.object({
  body: body.optional().default({}),
  params: z.object(params),
  query: z.object(query),
});

const createPatientSchema = requestSchema(
  z.object(patientFields).strict()
);

const updatePatientSchema = requestSchema(
  z.object(patientFields).strict(),
  { id: uuidSchema }
);

const getPatientSchema = requestSchema(
  z.object({}),
  { id: uuidSchema }
);

const listPatientsSchema = requestSchema(
  z.object({}),
  {},
  {
    search: z.string().trim().max(100, 'Recherche limitée à 100 caractères.').optional(),
    page: z.string()
      .regex(/^[1-9]\d*$/, 'Page invalide.')
      .optional(),
    limit: z.string()
      .regex(/^[1-9]\d*$/, 'Limite invalide.')
      .optional(),
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
  createPatientSchema,
  updatePatientSchema,
  getPatientSchema,
  listPatientsSchema,
};
