import jwt from 'jsonwebtoken';
import config from '../config/configs.js';

export class Token {
    async generateAccessToken(payload) {
        return jwt.sign(payload, config.ACCESS_TOKEN_KEY, {
            expiresIn: config.ACCESS_TOKEN_TIME
        })
    }

    async generateRefreshToken(payload) {
        return jwt.sign(payload, config.REFRESH_TOKEN_KEY, {
            expiresIn: config.REFRESH_TOKEN_TIME
        })
    }

    async verifyToken(token, key) {
        return jwt.verify(token, key);
    }
}