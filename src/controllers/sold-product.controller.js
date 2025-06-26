import SoldProduct from '../models/sold-product.model.js';
import Client from '../models/client.model.js';
import Product from '../models/product.model.js';
import { errorHandle } from '../helpers/error-handle.js';
import { successHandle } from '../helpers/success-handle.js';
import { createSoldProductValidator, updateSoldProductValidator } from '../validations/sold-product.validation.js';
import { isValidObjectId } from 'mongoose';

export class SoldProductController {
    async createSoldProduct(req, res) {
        try {
            const { value, error } = createSoldProductValidator(req.body);
            if (error) {
                return errorHandle(res, error, 422)
            }

            const existsSoldProduct = await SoldProduct.findOne({ name: value.name });
            if (existsSoldProduct) {
                return errorHandle(res, 'Sold product already exists');
            }
            
            const client = await Client.findById(value.clientID);
            if (!client) {
                return errorHandle(res, 'Client not found', 404);
            }

            let product = await Product.findById(value.productID);
            if (!product) {
                return errorHandle(res, 'Product not found', 404);
            }

            if (+product.quantity < +value.quantity) {
                return errorHandle(res, 'Insufficient product quantity', 400);
            }

            const totalPrice = +product.price * +value.quantity;
            const updatedQuantityOfProduct = +product.quantity - +value.quantity;
            await Product.findByIdAndUpdate(value.productID, {
                quantity: updatedQuantityOfProduct
            });

            const soldProduct = await SoldProduct.create({
                ...value,
                totalPrice
            });
            return successHandle(res, soldProduct)
        } catch (error) {
            return errorHandle(res, error)
        }
    }

    async getSoldProducts(req, res) {
        try {
            const soldProducts = await SoldProduct.find().populate('clientID').populate('productID');
            return successHandle(res, soldProducts);
        } catch (error) {
            return errorHandle(res, error)
        }
    }

    async getSoldProductById(req, res) {
        try {
            const id = req.params.id;
            const soldProduct = await SoldProductController.findSoldProductById(res, id);
            if (!soldProduct) {
                return errorHandle(res, 'Error on finding sold product', 400);
            }
            return successHandle(res, soldProduct);
        } catch (error) {
            return errorHandle(res, error);
        }
    }

    async updateSoldProduct(req, res) {
        try {
            const id = req.params.id;
            const soldProduct = await SoldProductController.findSoldProductById(res, id);
            if (!soldProduct) {
                return errorHandle(res, 'Error on finding sold product', 400);
            }

            const { value, error } = updateSoldProductValidator(req.body);
            if (error) {
                return errorHandle(res, error, 422);
            }

            if (value.clientID && value.productID) {
                const client = await Client.findById(value.clientID);
                if (!client) {
                    return errorHandle(res, 'Client not found', 404);
                }

                const product = Product.findById(value.productID);
                if (!product) {
                    return errorHandle(res, 'Product not found', 404);
                }
            } else {
                return errorHandle(res, 'Invalid input', 400);
            }

            const updatedSoldProduct = await SoldProduct.findByIdAndUpdate(id, value, { new: true }).populate('clientID').populate('productID');
            return successHandle(res, updatedSoldProduct);
        } catch (error) {
            return errorHandle(res, error)
        }
    }

    async deleteSoldProduct(req, res) {
        try {
            const id = req.params.id;
            await SoldProductController.findSoldProductById(res, id);
            await SoldProduct.findByIdAndDelete(id);
            return successHandle(res, {
                message: 'SoldProduct successfully deleted'
            })
        } catch (error) {
            return errorHandle(res, error)
        }
    }

    static async findSoldProductById(res, id) {
        try {
            if (!isValidObjectId(id)) {
                return errorHandle(res, 'Invalid id', 400);
            }

            const SoldProduct = await SoldProduct.findById(id).populate('clientID').populate('productID');
            if (!SoldProduct) {
                return errorHandle(res, 'SoldProduct not found', 404);
            }
            return SoldProduct;
        } catch (error) {
            return errorHandle(res, error)
        }
    }
}