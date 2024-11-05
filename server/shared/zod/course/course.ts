import z from 'zod';

export const zodCourseSchema = z.object({
    course_code: z.string({message: "Course code is required"}),
    course_name: z.string({message: "Course name is required"}),
    course_description: z.string({message: "Course description is required"}),
    course_thumbnail: z.string({message: "Course thumbnail is required"}).url({message: "Invalid URL"}),
});

export type zodCourseSchemaType = z.infer<typeof zodCourseSchema>;