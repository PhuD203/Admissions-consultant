// src/lib/schemas/consulting-data-schema.ts
import { z } from 'zod';

// Consulting Data Schema (unchanged, assuming link_facebook fix from previous iteration is applied)
export const consultingDataSchema = z.object({
  student_id: z.number(),
  student_name: z.string(),
  email: z.string().email().nullable(),
  phone_number: z.string(),
  zalo_phone: z.string().nullable(),
  // Assuming you chose option 1 or 2 for link_facebook fix, e.g.:
  link_facebook: z
    .string()
    .url() // Vẫn muốn kiểm tra URL đầy đủ nếu nó là một URL
    .nullable() // Hoặc là null
    .or(z.literal('')) // Hoặc là chuỗi rỗng
    .or(z.string().regex(/^fb\.com\/.+/)), // Hoặc là chuỗi bắt đầu bằng "fb.com/"
  date_of_birth: z.string().nullable(),
  current_education_level: z.string(),
  other_education_level_description: z.string().nullable(),
  high_school_name: z.string().nullable(),
  city: z.string(),
  source: z.string(),
  notification_consent: z.string(),
  current_status: z.string(),
  status_change_date: z.string().nullable(),
  registration_date: z.string().nullable(),
  student_created_at: z.string(),
  student_updated_at: z.string(),
  assigned_counselor_name: z.string(),
  assigned_counselor_type: z.string(),
  interested_courses_details: z.string().nullable(),
  enrolled_courses_details: z.string().nullable(),
  student_status_history: z.string().nullable(),
  last_consultation_date: z.string().nullable(),
  last_consultation_duration_minutes: z.number().nullable(),
  last_consultation_notes: z.string().nullable(),
  last_consultation_type: z.string().nullable(),
  last_consultation_status: z.string().nullable(),
  last_consultation_counselor_name: z.string().nullable(),
  gender: z.string().nullable(),
  other_source_description: z.string().nullable(),
  other_notification_consent_description: z.string().nullable(),
});

export type ConsultingTableRow = z.infer<typeof consultingDataSchema>;

// Metadata Schema (unchanged)
export const metadataSchema = z.object({
  totalRecords: z.number(),
  firstPage: z.number(),
  lastPage: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type Metadata = z.infer<typeof metadataSchema>;

// CORRECTED consultingApiResponseSchema
export const consultingApiResponseSchema = z.object({
  status: z.string(), // Root level status
  data: z.object({
    consultingInformation: z.array(consultingDataSchema),
    metadata: metadataSchema,
    // Add the unexpected 'status' field that's duplicated inside 'data'
    status: z.string().optional(), // It exists, but it's redundant and probably should be ignored or confirmed as optional.
    // Mark as .optional() to allow it to be there without causing an error.
  }),
  // If the root metadata is truly separate and consistently present, you might add it here.
  // Based on the log, it looks like [Prototype]: Object, which might not be a direct JSON field.
  // If your API explicitly returns a root 'metadata' field, uncomment this:
  // metadata: metadataSchema.optional(), // Make it optional in case it's not always there or handled differently
});

export type ConsultingApiResponse = z.infer<typeof consultingApiResponseSchema>;
