import z from 'zod';

export const zodInstructorSchema = z.object({
    user_id: z.string({message: "User id is required"}),
    instructor_id: z.string({message: "Instructor id is required"}),
    class_code: z.string({message: "Class code is required"}),
});

export type zodInstructorSchemaType = z.infer<typeof zodInstructorSchema>;