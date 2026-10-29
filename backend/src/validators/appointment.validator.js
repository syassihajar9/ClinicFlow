
const { z } = require('zod');

const uuidSchema = z.string().uuid('Identifiant UUID invalide.');

const appointmentStatusSchema = z.enum([
  'pending',
  'confirmed',
  'cancelled',
]);

// Validation de la création d'un rendez-vous
const createAppointmentSchema = z.object({
  body: z.object({
    patient_id: uuidSchema,
    appointment_date: z.string().datetime({
      offset: true,
      message: 'La date doit contenir un fuseau horaire.',
    }),
    reason: z.string()
      .trim()
      .min(1, 'Le motif est obligatoire.')
      .max(500, 'Le motif ne doit pas dépasser 500 caractères.'),
    status: appointmentStatusSchema.optional(),
    notes: z.string()
      .trim()
      .max(2000, 'Les notes ne doivent pas dépasser 2000 caractères.')
      .optional(),
  }).strict(),
  params: z.object({}),
  query: z.object({}),
});

// Validation de la liste et de ses filtres
const listAppointmentsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}),
  query: z.object({
    date: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La date doit être au format YYYY-MM-DD.')
      .optional(),
    status: appointmentStatusSchema.optional(),
  }),
});

// Validation de la consultation par ID
const getAppointmentSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  query: z.object({}),
});

// Validation de la modification complète d'un rendez-vous
const updateAppointmentSchema = z.object({
  body: z.object({
    patient_id: uuidSchema.optional(),
    appointment_date: z.string().datetime({
      offset: true,
      message: 'La date doit contenir un fuseau horaire.',
    }).optional(),
    reason: z.string()
      .trim()
      .min(1, 'Le motif ne peut pas être vide.')
      .max(500, 'Le motif ne doit pas dépasser 500 caractères.')
      .optional(),
    status: appointmentStatusSchema.optional(),
    notes: z.string()
      .trim()
      .max(2000, 'Les notes ne doivent pas dépasser 2000 caractères.')
      .nullable()
      .optional(),
  }).strict().refine(
    (data) => Object.keys(data).length > 0,
    { message: 'Au moins un champ doit être fourni pour la modification.' }
  ),
  params: z.object({
    id: uuidSchema,
  }),
  query: z.object({}),
});

// Validation du changement de statut uniquement
const updateStatusSchema = z.object({
  body: z.object({
    status: appointmentStatusSchema,
  }).strict(),
  params: z.object({
    id: uuidSchema,
  }),
  query: z.object({}),
});

module.exports = {
  createAppointmentSchema,
  listAppointmentsSchema,
  getAppointmentSchema,
  updateAppointmentSchema,
  updateStatusSchema,
};
