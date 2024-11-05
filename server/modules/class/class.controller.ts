import type { Request, Response } from 'express';
import ClassModel from "../../modules/class/class.model";
import type {zodClassSchemaType} from '../../shared/zod/class/class';


const test = async (req: Request, res: Response) => {
    const {id} = req.params;

    const classData: zodClassSchemaType | null = await ClassModel.findById({instructor_id: id});
}