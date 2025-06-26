import { Schema, model } from "mongoose";

const SalesmanSchema = new Schema({
    username: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: { type: Number, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    hashedPassword: { type: String, required: true},
})

const Salesman = model('Salesman', SalesmanSchema);
export default Salesman;