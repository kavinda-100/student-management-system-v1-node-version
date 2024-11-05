import mongoose from "mongoose";
import type {zodClassSchemaType} from "@shared/zod/class/class";

type zodTypeWithOutInstructorID = Omit<zodClassSchemaType, "instructor_id">

type classSchemaType = zodTypeWithOutInstructorID & {
    instructor_id: mongoose.Schema.Types.ObjectId;
}

const classSchema = new mongoose.Schema<classSchemaType>({
    class_code: {type: String, required: true},
    class_name: {type: String, required: true},
    instructor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstructorModel',
        required: true
    },
});

const ClassModel = mongoose.model('ClassModel', classSchema);

export default ClassModel;
