import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import Salesman from '../models/salesman.model.js';
import { createProductValidator, updateProductValidator } from '../validations/product.validation.js';
import { errorHandle } from '../helpers/error-handle.js';
import { successHandle } from '../helpers/success-handle.js';
import { isValidObjectId } from 'mongoose';


export class ProductController {
    async createProduct(req, res) {
        try {
            const { value, error } = createProductValidator(req.body);
            if (error) {
                return errorHandle(res, error, 422)
            }

            const existsProduct = await Product.findOne({ name: value.name });
            if (existsProduct) {
                return errorHandle(res, 'Product already exists');
            }
            
            const category = Category.findById(value.categoryID);
            if (!category) {
                return errorHandle(res, 'Category not found', 404);
            }

            const salesman = Salesman.findById(value.salesmanID);
            if (!salesman) {
                return errorHandle(res, 'Salesman not found', 404);
            }

            const product = await Product.create(value);
            return successHandle(res, product)
        } catch (error) {
            return errorHandle(res, error)
        }
    }

    async getProducts(req, res) {
        try {
            const products = await Product.find().populate('categoryID').populate('salesmanID');
            return successHandle(res, products);
        } catch (error) {
            return errorHandle(res, error)
        }
    }

    async getProductById(req, res) {
        try {
            const id = req.params.id;
            const product = await ProductController.findProductById(res, id);
            if (!product) {
                return errorHandle(res, 'Error on finding product', 400);
            }
            return successHandle(res, product);
        } catch (error) {
            return errorHandle(res, error);
        }
    }

    async updateProduct(req, res) {
        try {
            const id = req.params.id;
            const product = await ProductController.findProductById(res, id);
            if (!product) {
                return errorHandle(res, 'Error on finding product', 400);
            }

            const { value, error } = updateProductValidator(req.body);
            if (error) {
                return errorHandle(res, error, 422);
            }

            if (value.categoryID && value.salesmanID) {
                const category = await Category.findById(value.categoryID);
                if (!category) {
                    return errorHandle(res, 'Category not found', 404);
                }

                const salesman = Salesman.findById(value.salesmanID);
                if (!salesman) {
                    return errorHandle(res, 'Salesman not found', 404);
                }
            } else {
                return errorHandle(res, 'Invalid input', 400);
            }

            const updatedProduct = await Product.findByIdAndUpdate(id, value, { new: true }).populate('categoryID').populate('salesmanID');
            return successHandle(res, updatedProduct);
        } catch (error) {
            return errorHandle(res, error)
        }
    }

    async deleteProduct(req, res) {
        try {
            const id = req.params.id;
            await ProductController.findProductById(res, id);
            await Product.findByIdAndDelete(id);
            return successHandle(res, {
                message: 'Product successfully deleted'
            })
        } catch (error) {
            return errorHandle(res, error)
        }
    }

    static async findProductById(res, id) {
        try {
            if (!isValidObjectId(id)) {
                return errorHandle(res, 'Invalid id', 400);
            }

            const product = await Product.findById(id).populate('categoryID').populate('salesmanID');
            if (!product) {
                return errorHandle(res, 'Product not found', 404);
            }
            return product;
        } catch (error) {
            return errorHandle(res, error)
        }
    }
}