import z from 'zod';

export const zodClassMemberSchema = z.object({
    class_code: z.string({message: "Class code is required"}),
    student_id: z.string({message: "Student id is required"}),
});

export type zodClassMemberSchemaType = z.infer<typeof zodClassMemberSchema>;