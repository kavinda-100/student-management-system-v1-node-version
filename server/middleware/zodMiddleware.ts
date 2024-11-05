import z from 'zod';
import type { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../helper/responseHandeler';
import {zodIssueError} from "../helper/zod";

//middleware to validate the request body by zod
/**
 * @param schema - zod schema object
 * @returns middleware function
 * @description this middleware function validates the request body by the given zod schema object
 * */
export const zodMiddleware = (schema: z.ZodObject<any, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.safeParse(req.body);
      if (!validatedData.success) {
        errorResponse(res, 400, zodIssueError(validatedData.error.errors));
      }
      req.body = validatedData.data;
      next();
    } catch (error: any) {
      errorResponse(res, 400, error.message);
    }
  };
};