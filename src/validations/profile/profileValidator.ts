import joi from "joi";

// export const postSchema = joi.object({
//     id: joi.number().optional(),
//     userId: joi.number().optional(),
//     postText: joi.string().optional(),
//     postImage: joi.string().optional(),
//     postDate: joi.string().optional(),
// });
export const postSchema = joi.object({
    userId: joi.number().optional(),
});