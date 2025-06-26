import { Schema, Types, model } from 'mongoose';

const ProductSchema = new Schema({
    productID: { type: Types.ObjectId, ref: 'Product' },
    clientID: { type: Types.ObjectId, ref: 'Client' },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, optional: true }
}, {
    timestamps: true
})

const SoldProduct = model('SoldProduct', ProductSchema);
export default SoldProduct;