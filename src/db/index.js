import { connect } from "mongoose";
import config from '../config/configs.js';

export const connectDB = async () => {
    try {
        await connect(config.MONGO_URI);
        console.log('Successfully connected to database');
    } catch (error) {
        console.log(`Error on connecting to database ${error}`)
    }
}