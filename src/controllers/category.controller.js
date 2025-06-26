import Category from '../models/category.model.js';
import Product from '../models/product.model.js';
import { createCategoryValidator, updateCategoryValidator } from '../validations/category.validation.js';
import { errorHandle } from '../helpers/error-handle.js';
import { successHandle } from '../helpers/success-handle.js';
import { isValidObjectId, Types } from 'mongoose';

export class CategoryController {
    async createCategory(req, res) {
        try {
            const { value, error } = createCategoryValidator(req.body);
            if (error) {
                return errorHandle(res, error, 422)
            }

            const existsCategory = await Category.findOne({ name: value.name });
            if (existsCategory) {
                return errorHandle(res, 'Category already exists');
            }

            const category = await Category.create(value);
            return successHandle(res, category)
        } catch (error) {
            return errorHandle(res, error)
        }
    }

    async getCategory(req, res) {
        try {
            const category = await Category.aggregate([
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: 'categoryID',
                        as: 'products'
                    }
                }
            ]);
            return successHandle(res, category);
        } catch (error) {
            return errorHandle(res, error)
        }
    }

    async getCategoryById(req, res) {
        try {
            const id = req.params.id;
            if (!isValidObjectId(id)) {
                return errorHandle(res, 'Invalid id', 400);
            }

            const category = await Category.aggregate([
                {
                    $match: { _id: new Types.ObjectId(String(id)) }
                }, {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: 'categoryID',
                        as: 'products'
                    }
                }

            ])
            return successHandle(res, category);
        } catch (error) {
            return errorHandle(res, error);
        }
    }

    async updateCategory(req, res) {
        try {
            const id = req.params.id;
            const category = await CategoryController.findCategoryById(res, id);
            if (!category) {
                return errorHandle(res, 'Error on finding category', 400);
            }

            const { value, error } = updateCategoryValidator(req.body);
            if (error) {
                return errorHandle(res, error, 422);
            }

            const updatedCategory = await Category.findByIdAndUpdate(id, value, { new: true });
            return successHandle(res, updatedCategory);
        } catch (error) {
            return errorHandle(res, error)
        }
    }

    async deleteCategory(req, res) {
        try {
            const id = req.params.id;
            await CategoryController.findCategoryById(res, id);
            await Category.findByIdAndDelete(id);
            return successHandle(res, {
                message: 'Category successfully deleted'
            })
        } catch (error) {
            return errorHandle(res, error)
        }
    }

    static async findCategoryById(res, id) {
        try {
            if (!isValidObjectId(id)) {
                return errorHandle(res, 'Invalid id', 400);
            }

            const category = await Category.findById(id);
            if (!category) {
                return errorHandle(res, 'Category not found', 404);
            }
            return category;
        } catch (error) {
            return errorHandle(res, error)
        }
    }
}