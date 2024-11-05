import type {Request, Response, NextFunction} from "express";
import {errorResponse, successResponse} from "../../helper/responseHandeler";
import userModel from "./user.model";

/**
 * @param req - Request object,
 * @param res - Response object,
 * @param next - NextFunction object
 * @returns  return user profile
 * @description use for get the user profile
 * */
export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;
        //find user by id
        const user = await userModel.findById(userId);
        //check if user exists
        if (!user) {
            errorResponse(res, 404, "User not found");
            return;
        }
        //remove password from a user object
        const {password, ...userWithoutPassword} = user.toObject();
        //send response
        successResponse(res, 200, "User profile", userWithoutPassword);
    } catch (error: any) {
        next(error);
    }
}
