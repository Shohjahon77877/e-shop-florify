import { Schema, Types, model } from "mongoose";

const ProductSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    color: { type: String, required: true },
    categoryID: { type: Types.ObjectId, ref: 'Category' },
    salesmanID: { type: Types.ObjectId, ref: 'Salesman'},
})

const Product = model('Product', ProductSchema);
export default Product;