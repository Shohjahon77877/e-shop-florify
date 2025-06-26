import { Schema, model } from "mongoose";

const ClientSchema = new Schema({
    name: { type: String, required: true },
    phone: { type: Number, unique: true, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    hashedPassword: { type: String, required: true },
})

const Client = model('Client', ClientSchema);
export default Client;