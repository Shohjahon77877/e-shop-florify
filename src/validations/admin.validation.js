import Joi from 'joi';

export const createAdminValidator = (data) => {
    const admin = Joi.object({
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.number().required(),
        password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",<.>/?\\|`~]).{8,20}$/).required(),
    })

    return admin.validate(data);
}

export const signInAdminValidator = (data) => {
    const admin = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    })

    return admin.validate(data);
}

export const confirmAdminSignInValidator = (data) => {
    const admin = Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().length(6).required()
    })

    return admin.validate(data);
}

export const updateAdminValidator = (data) => {
    const admin = Joi.object({
        username: Joi.string().optional(),
        email: Joi.string().email().optional(),
        phone: Joi.number().optional(),
        password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",<.>/?\\|`~]).{8,20}$/).optional(),
    })

    return admin.validate(data);
}