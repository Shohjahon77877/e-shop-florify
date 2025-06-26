import { Schema, model } from "mongoose"; 

const AdminSchema = new Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: function() {
      return this.role === 'admin';
    }},
    phone: { type: Number, unique: true, required: function() {
      return this.role === 'admin';
    }},
    hashedPassword: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
}, {
    timestamps: true
})

const Admin = model('Admin', AdminSchema);
export default Admin;