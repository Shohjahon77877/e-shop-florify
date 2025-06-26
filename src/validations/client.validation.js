import Joi from "joi";

export const clientSignUpValidator = (data) => {
    const client = Joi.object({
        name: Joi.string().required(),
        phone: Joi.number().required(),
        address: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",<.>/?\\|`~]).{8,20}$/).required(),
    })

    return client.validate(data);
}

export const clientSignInValidator = (data) => {
    const client = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    })

    return client.validate(data);
}

export const confirmClientSignInValidator = (data) => {
    const client = Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().length(6).required()
    })

    return client.validate(data);
}

export const updateClientValidator = (data) => {
    const client = Joi.object({
        name: Joi.string().optional(),
        phone: Joi.number().optional(),
        address: Joi.string().optional(),
        email: Joi.string().email().optional(),
        password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",<.>/?\\|`~]).{8,20}$/).optional(),
    })

    return client.validate(data, { abortEarly: false })
}