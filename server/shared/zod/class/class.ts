import z from 'zod';

// import mongoose from 'mongoose';

// const objectIdValidation = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
//     message: "Invalid ObjectId",
// });

export const zodClassSchema = z.object({
    class_code: z.string({message: "Class code is required"}),
    class_name: z.string({message: "Class name is required"}),
    instructor_id: z.string({message: "Instructor is required"})
});

export type zodClassSchemaType = z.infer<typeof zodClassSchema>;