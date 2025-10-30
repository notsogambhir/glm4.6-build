import { z } from 'zod';

export const studentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  name: z.string().min(1, 'Student name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  programId: z.string().optional(),
  batchId: z.string().optional(),
});

export const updateStudentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required').optional(),
  name: z.string().min(1, 'Student name is required').optional(),
  programId: z.string().min(1, 'Program is required').optional(),
  batchId: z.string().min(1, 'Batch is required').optional(),
  isActive: z.boolean().optional(),
});

export const bulkStudentSchema = z.object({
  students: z.array(z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    name: z.string().min(1, 'Student name is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    programId: z.string().optional(),
    batchId: z.string().optional(),
  }))
});

export type StudentInput = z.infer<typeof studentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type BulkStudentInput = z.infer<typeof bulkStudentSchema>;