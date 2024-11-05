import mongoose from "mongoose";
import type {zodClassSchemaType} from "@shared/zod/class/class.courses";

type zodTypeWithOutInstructorID = Omit<zodClassSchemaType, "course_code">

type classSchemaType = zodTypeWithOutInstructorID & {
    course_code: mongoose.Schema.Types.ObjectId;
}

const classCoursesSchema = new mongoose.Schema<classSchemaType>({
    class_code: {type: String, required: true},
    course_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseModel',
        required: true
    },
});

const ClassCoursesModel = mongoose.model('ClassModel', classCoursesSchema);

export default ClassCoursesModel;