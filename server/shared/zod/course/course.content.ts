import z from 'zod';

export const zodFileTypeEnum = z.enum(["pdf", "doc", "docx", "ppt", "pptx", "xlsx"],
    {
        message: "Invalid file type",
        invalid_type_error: "Invalid file type (pdf, doc, docx, ppt, pptx, xlsx)"
    }
);

export const zodCourseContentSchema = z.object({
    course_code: z.string({message: "Course code is required"}),
    file_type: zodFileTypeEnum,
    file_url: z.string({message: "File URL is required"}).url({message: "Invalid URL"}),
});

export type zodCourseContentSchemaType = z.infer<typeof zodCourseContentSchema>;