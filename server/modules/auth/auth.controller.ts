import type { Request, Response, NextFunction} from "express";
import bcryptjs from "bcryptjs";

import type {zodUserSchemaType, zodUserSignInSchemaType} from "../../shared/zod/user/user.zod.ts";
import type {zodResetEmailSchemaType, zodResetPasswordSchemaType} from "../../shared/zod/validation.zod.ts";
import {errorResponse, successResponse} from "../../helper/responseHandeler";
import userModel from "../../modules/user/user.model";
import verificationModel from "../../modules/otherModels/verficationModel";
import {setCookie} from "../../helper/cookies";
import {sendInvitationEmail, sendMagicLinkEmail, sendOTPEmail} from "../../helper/emails";
import {generateMagicLink, generateOTP} from "../../helper/emails/generate";
import dotenv from "dotenv";

dotenv.config();

const DOMAIN_NAME = process.env.DOMAIN_NAME;

/**
 * @param req - Request object,
 * @param res - Response object,
 * @param next - NextFunction object
 * @returns  return created user
 * @description Create a new user for the application and only admin can create users'
 * */
export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body as zodUserSchemaType;
        // check if the user already exists
        const userExists = await userModel.findOne({email: data.email});
        // if user already exists
        if (userExists) {
            errorResponse(res, 400, "User already exists");
            return;
        }
        // hash password
        const hashedPassword = await bcryptjs.hash(data.password, 10);
        //save user to database
        const user = new userModel({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword,
            role: data.role,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth,
            isActive: data.isActive,
            profilePicture: data.profilePicture,
            phoneNumber: data.phoneNumber,
            address: data.address,
        });
        await user.save();
        // here don't set the cookie here, because only admin can create users'
        //send the invitation email
        const logo = "https://www.edufusion.com/logo.png";
        const inviteLink = `${DOMAIN_NAME}/auth/sign-in`;
        const isEmailSent = await sendInvitationEmail({inviteLink, logo, user, password: data.password});
        // if email is not sent
        if (!isEmailSent) {
            errorResponse(res, 500, "Email not sent");
            return;
        }
        //user without a password
        const {password, ...userWithoutPassword} = user.toObject();
        //send response
        successResponse(res, 201, "user created successfully and Invitation email is sent.", userWithoutPassword);
    } catch (error: any) {
        next(error);
    }
}

/**
 * @param req - Request object,
 * @param res - Response object,
 * @param next - NextFunction object
 * @returns  return user with token/cookie
 * @description Sign in user to the application for the user [admin, student, teacher]
 * @example domain.com/api/v1/auth/sign-in
 * */
export const signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body as zodUserSignInSchemaType;
        // find user by email
        const user = await userModel.findOne({email: data.email});
        // check if user exists
        if (!user) {
            errorResponse(res, 404, "User not found");
            return
        }
        // check if the password is correct
        const isPasswordCorrect = await bcryptjs.compare(data.password, user.password);
        // if the password is not correct
        if (!isPasswordCorrect) {
            errorResponse(res, 400, "Invalid credentials");
            return
        }
        // check if the user is active
        if (!user.isActive) {
            errorResponse(res, 400, "User is not active");
            return
        }
        // if a provided role is not mach with the user role
        if (data.role !== user.role) {
            errorResponse(res, 400, "Role is not matched");
            return
        }
        setCookie(res, user);
        //user without a password
        const {password, ...userWithoutPassword} = user.toObject();
        //send response
        successResponse(res, 200, "SignIn successfully", userWithoutPassword);
    } catch (error) {
        next(error);
    }
}

/**
 * @param req - Request object,
 * @param res - Response object,
 * @param next - NextFunction object
 * @returns  return message
 * @description Sign out user from the application
 * @example domain.com/api/v1/auth/sign-out
 * */
export const signOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // clear cookie
        res.clearCookie("access_token");
        //send response
        successResponse(res, 200, "SignOut successfully");
    } catch (error) {
        next(error);
    }
}

/**
 * @param req - Request object,
 * @param res - Response object,
 * @param next - NextFunction object
 * @description This method is for asking for resetting the password
 * */
export const askResetPassword = async (req: any, res: Response, next: NextFunction) => {
    try {
        // get user from request
        const user = req.user;
        // find user by id
        const userExists = await userModel.findById(user._id);
        // if user doesn't exist
        if (!userExists) {
            errorResponse(res, 404, "User not found");
            return;
        }
        // generate otp and save it to the database (verificationModel)
        const OTP = generateOTP(6)
        // save otp to the database
        const newVerification = new verificationModel({
            email: userExists.email,
            otp: OTP,
            isOTP: true,
        })
        await newVerification.save();
        // send otp to user with the email
        const isEmailSent = await sendOTPEmail({receiverEmail: userExists.email, receiverName: userExists.firstName, OTP});
        // if email is not sent
        if (!isEmailSent) {
            errorResponse(res, 500, "Email not sent");
            return;
        }
        //send response
        successResponse(res, 200, "Sent OTP to your email", {email: userExists.email});
    }
    catch (error) {
        next(error);
    }
}

/**
 * @param req - Request object,
 * @param res - Response object,
 * @param next - NextFunction object
 * @description - This method is for resetting the password
 * */
export const resetPassword = async (req: any, res: Response, next: NextFunction) => {
    try {
        const data = req.body as zodResetPasswordSchemaType;
        // get user from request
        const user = req.user;
        // find user by id
        const userExists = await userModel.findById(user._id);
        // if user doesn't exist
        if (!userExists) {
            errorResponse(res, 404, "User not found");
            return;
        }
        // check if the otp is a correct one
        // find otp from the database
        const verification = await verificationModel.findOne({
            email: userExists.email,
            isOTP: true,
            otp: data.otp
        });
        // if otp doesn't exist
        if (!verification) {
            errorResponse(res, 404, "OTP not found");
            return;
        }
        // check if the otp is correct
        if (verification.otp !== data.otp) {
            errorResponse(res, 400, "Invalid OTP");
            return;
        }
        // check if the otp is expired (OTP will expire in 1 hour)
        /**
         * 1.currentTime gets the current time in milliseconds.
         * 2.otpTime gets the time when the OTP was created in milliseconds.
         * 3.difference calculates the time difference between the current time and the OTP creation time.
         * 4.If the difference is greater than 3,600,000 milliseconds (1 hour), it means the OTP has expired.
         */
        const currentTime = new Date().getTime();
        const otpTime = new Date(verification.createdAt).getTime();
        const difference = currentTime - otpTime;
        if (difference > 3600000) {
            errorResponse(res, 400, "OTP expired");
            return;
        }
        // hash password
        const hashedPassword = await bcryptjs.hash(data.password, 10);
        // update user password
        const updatedUser = await userModel.findByIdAndUpdate(
            {_id: user._id},
            {password: hashedPassword},
            {new: true}
        );
        // if a user doesn't update
        if (!updatedUser) {
            errorResponse(res, 500, "Password reset failed");
            return;
        }
        // delete the otp from the database
        await verificationModel.deleteOne({email: userExists.email, otp: data.otp ,isOTP: true});
        //user without a password
        const {password, ...userWithoutPassword} = updatedUser.toObject();
        //send response
        successResponse(res, 200, "Password reset successfully", userWithoutPassword);
    } catch (error) {
        next(error);
    }
}

/**
 * @param req - Request object,
 * @param res - Response object,
 * @param next - NextFunction object
 * @description - This method is for asking for email verification
 */
export const askEmailVerification = async (req: any, res: Response, next: NextFunction) => {
    try {
        // get user from request
        const user = req.user;
        // find user by id
        const userExists = await userModel.findById(user._id);
        // if user doesn't exist
        if (!userExists) {
            errorResponse(res, 404, "User not found");
            return;
        }
        // check if the email is already verified
        if (userExists.isEmailVerified) {
            errorResponse(res, 400, "Email already verified");
            return;
        }
        // generate magicLink and save it to the database (verificationModel)
        const Token = generateMagicLink()
        // save magicLink to the database
        const newVerification = new verificationModel({
            email: userExists.email,
            token: Token,
            isToken: true,
        })
        await newVerification.save();
        // set the url path for the magicLink
        const urlPath = `${DOMAIN_NAME}/auth/verify-email?magicLink=${Token}`;
        // send magicLink to user with the email
        const isEmailSent = await sendMagicLinkEmail({
                receiverEmail: userExists.email,
                receiverName: userExists.firstName,
                buttonText: "Verify Email",
                subText: "Verify of your email",
                path: urlPath
            });
        // if email is not sent
        if (!isEmailSent) {
            errorResponse(res, 500, "Email not sent");
            return;
        }
        //send response
        successResponse(res, 200, "Sent email successfully. check your inbox!", {email: userExists.email});
    }
    catch (error) {
        next(error);
    }
}

/*
* @param req - Request object,
* @param res - Response object,
* @param next - NextFunction object
* @description - This method is for verifying the email
* */
export const verifyEmail = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {token} = req.params;
        const user = req.user;
        // if token is not provided
        if (!token) {
            errorResponse(res, 400, "Token is required");
            return;
        }
        // find token from the database
        const verification = await verificationModel.findOne({
            email: user.email,
            token,
            isToken: true
        });
        // if token doesn't exist
        if (!verification) {
            errorResponse(res, 404, "Token not found");
            return;
        }
        // check if the token is expired (Token will expire in 1 hour)
        /**
         * 1.currentTime gets the current time in milliseconds.
         * 2.tokenTime gets the time when the token was created in milliseconds.
         * 3.difference calculates the time difference between the current time and the token creation time.
         * 4.If the difference is greater than 3,600,000 milliseconds (1 hour), it means the token has expired.
         */
        const currentTime = new Date().getTime();
        const tokenTime = new Date(verification.createdAt).getTime();
        const difference = currentTime - tokenTime;
        if (difference > 3600000) {
            errorResponse(res, 400, "Token expired");
            return;
        }
        // update user email verification status
        const updatedUser = await userModel.findOneAndUpdate(
            {email: verification.email},
            {isEmailVerified: true},
            {new: true}
        );
        // if a user doesn't update
        if (!updatedUser) {
            errorResponse(res, 500, "Email verification failed");
            return;
        }
        // delete the token from the database
        await verificationModel.deleteOne({email: verification.email, token, isToken: true});
        //user without a password
        const {password, ...userWithoutPassword} = updatedUser.toObject();
        //send response
        successResponse(res, 200, "Email verified successfully", userWithoutPassword);
    } catch (error) {
        next(error);
    }
}


/**
 * @param req - Request object,
 * @param res - Response object,
 * @param next - NextFunction object
 * @description - This method is for asking for email reset
 * */
export const askEmailReset = async (req: any, res: Response, next: NextFunction) => {
    try {
        // get user from request
        const user = req.user;
        // find user by id
        const userExists = await userModel.findById(user._id);
        // if user doesn't exist
        if (!userExists) {
            errorResponse(res, 404, "User not found");
            return;
        }
        // generate magicLink and save it to the database (verificationModel)
        const Token = generateMagicLink()
        // save magicLink to the database
        const newVerification = new verificationModel({
            email: userExists.email,
            token: Token,
            isToken: true,
        })
        await newVerification.save();
        // set the url path for the magicLink
        const urlPath = `${DOMAIN_NAME}/auth/reset-email?magicLink=${Token}`;
        // send magicLink to user with the email
        const isEmailSent = await sendMagicLinkEmail({
            receiverEmail: userExists.email,
            receiverName: userExists.firstName,
            buttonText: "Reset Email",
            subText: "Reset of your email",
            path: urlPath
        });
        // if email is not sent
        if (!isEmailSent) {
            errorResponse(res, 500, "Email not sent");
            return;
        }
        //send response
        successResponse(res, 200, "Sent email successfully. check your inbox!", {email: userExists.email});
    }
    catch (error) {
        next(error);
    }
}

/**
 * @param req - Request object,
 * @param res - Response object,
 * @param next - NextFunction object
 * @description - This method is for resetting the email
 */
export const resetEmail = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {token} = req.params;
        const user = req.user;
        const data = req.body as zodResetEmailSchemaType;

        // if token is not provided
        if (!token) {
            errorResponse(res, 400, "Token is required");
            return;
        }
        // find token from the database
        const verification = await verificationModel.findOne({
            email: user.email,
            token,
            isToken: true
        });
        // if token doesn't exist
        if (!verification) {
            errorResponse(res, 404, "Token not found");
            return;
        }
        // check if the token is expired (Token will expire in 1 hour)
        /**
         * 1.currentTime gets the current time in milliseconds.
         * 2.tokenTime gets the time when the token was created in milliseconds.
         * 3.difference calculates the time difference between the current time and the token creation time.
         * 4.If the difference is greater than 3,600,000 milliseconds (1 hour), it means the token has expired.
         */
        const currentTime = new Date().getTime();
        const tokenTime = new Date(verification.createdAt).getTime();
        const difference = currentTime - tokenTime;
        if (difference > 3600000) {
            errorResponse(res, 400, "Token expired");
            return;
        }
        // check if the new email is already in use
        const emailExists = await userModel.findOne({email: data.email});
        // if email is already in use
        if(emailExists){
            errorResponse(res, 400, "email is already in use")
            return
        }
        // update user email and verification status
        const updatedUser = await userModel.findOneAndUpdate(
            {email: verification.email},
            {
                email: data.email,
                isEmailVerified: false
            },
            {new: true}
        );
        // if a user doesn't update
        if (!updatedUser) {
            errorResponse(res, 500, "Email reset failed");
            return;
        }
        // delete the token from the database
        await verificationModel.deleteOne({email: verification.email, token, isToken: true});
        //user without a password
        const {password, ...userWithoutPassword} = updatedUser.toObject();
        //send response
        successResponse(res, 200, "Email reset successfully", userWithoutPassword);
    } catch (error) {
        next(error);
    }
}





