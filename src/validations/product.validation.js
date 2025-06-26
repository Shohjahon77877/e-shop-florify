import Joi from "joi";

export const createProductValidator = (data) => {
    const product = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required(),
        quantity: Joi.number().required(),
        color: Joi.string().required(),
        categoryID: Joi.string().required(),
        salesmanID: Joi.string().required(),
    })

    return product.validate(data);
}

export const updateProductValidator = (data) => {
    const product = Joi.object({
        name: Joi.string().optional(),
        description: Joi.string().optional(),
        price: Joi.number().optional(),
        quantity: Joi.number().optional(),
        color: Joi.string().optional(),
        categoryID: Joi.string().optional(),
        salesmanID: Joi.string().optional(),
    })

    return product.validate(data);
}