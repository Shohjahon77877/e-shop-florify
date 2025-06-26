import Joi from "joi";

export const createSalesmanValidator = (data) => {
    const salesman = Joi.object({
        username: Joi.string().required(),
        fullName: Joi.string().required(),
        phone: Joi.number().required(),
        address: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",<.>/?\\|`~]).{8,20}$/).required(),
    })

    return salesman.validate(data);
}

export const salesmanSignInValidator = (data) => {
    const salesman = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    })

    return salesman.validate(data);
}

export const confirmSalesmanSignInValidator = (data) => {
    const salesman = Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().length(6).required()
    })

    return salesman.validate(data);
}

export const updateSalesmanValidator = (data) => {
    const salesman = Joi.object({
        username: Joi.string().required(),
        fullName: Joi.string().required(),
        phone: Joi.number().required(),
        address: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",<.>/?\\|`~]).{8,20}$/).required(),
    })

    return salesman.validate(data);
}
