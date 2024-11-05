import mongoose from "mongoose";
import type {zodClassMemberSchemaType} from "@shared/zod/class/class.members";

type zodTypeWithOutStudentID = Omit<zodClassMemberSchemaType, "student_id">

type classMemberSchemaType = zodTypeWithOutStudentID & {
    student_id: mongoose.Schema.Types.ObjectId;
}

const classMemberSchema = new mongoose.Schema<classMemberSchemaType>({
    class_code: {type: String, required: true},
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentModel',
        required: true
    },
});

const ClassMemberModel = mongoose.model('ClassMemberModel', classMemberSchema);

export default ClassMemberModel;