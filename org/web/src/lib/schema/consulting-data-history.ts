// src/lib/schema/consulting-data-schema.ts

import { z } from 'zod';

// Assuming you have a schema for individual history items
// If this is not defined here, it should be imported or defined in this file.
export const consultationHistorySchema = z.object({
  consultation_session_id: z.number(),
  session_date: z.string(),
  duration_minutes: z.number().nullable(),
  session_type: z.string(),
  session_status: z.string(),
  session_notes: z.string().nullable(),
  counselor_name: z.string(),
  counseler_email: z.string().email(),
  student_name: z.string(),
  student_email: z.string().email().nullable(),
  student_phone_number: z.string(),
});

export const metadataSchema = z.object({
  totalRecords: z.number(),
  firstPage: z.number(),
  lastPage: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const consultingApiResponseSchemaHistory = z.object({
  status: z.string(),
  data: z.object({
    // This is the crucial change: it should be 'consultationHistory'
    consultationHistory: z.array(consultationHistorySchema),
    metadata: metadataSchema,
  }),
});

export type ConsultationHistory = z.infer<typeof consultationHistorySchema>;
export type Metadata = z.infer<typeof metadataSchema>;
export type ConsultingApiResponseHistory = z.infer<
  typeof consultingApiResponseSchemaHistory
>;
