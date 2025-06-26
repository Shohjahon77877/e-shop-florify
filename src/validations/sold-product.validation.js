import Joi from 'joi';

export const createSoldProductValidator = (data) => {
    const soldProduct = Joi.object({
        productID: Joi.string().required(),
        clientID: Joi.string().required(),
        quantity: Joi.number().required(),
    })

    return soldProduct.validate(data);
}

export const updateSoldProductValidator = (data) => {
    const soldProduct = Joi.object({
        productID: Joi.string().required(),
        clientID: Joi.string().required(),
        quantity: Joi.number().required(),
    })

    return soldProduct.validate(data);
}
