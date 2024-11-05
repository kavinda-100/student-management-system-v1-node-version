import type {zodUserSchemaType} from "../zod/user/user.zod";

export type UserType = zodUserSchemaType & {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}