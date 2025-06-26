import Client from '../models/client.model.js';
import { errorHandle } from '../helpers/error-handle.js';
import { successHandle } from '../helpers/success-handle.js';
import { Crypto } from '../utils/encrypt-decrypt.js';
import { Token } from '../utils/token-service.js';
import {
    clientSignUpValidator,
    clientSignInValidator,
    confirmClientSignInValidator,
    updateClientValidator
} from '../validations/client.validation.js';
import { transporter } from '../helpers/send-to-mail.js';
import { generateOTP } from '../helpers/otp-service.js';
import config from '../config/configs.js';
import NodeCache from 'node-cache';

const token = new Token();
const cache = new NodeCache();
const crypto = new Crypto();

export class ClientController {
    async clientSignUp(req, res) {
        try {
            const { value, error } = clientSignUpValidator(req.body);
            if (error) {
                return errorHandle(res, error, 422);
            }

            const existPhoneNumber = await Client.findOne({ phone: value.phone });
            if (existPhoneNumber) {
                return errorHandle(res, 'Phone number already registered ', 409);
            }

            const existEmail = await Client.findOne({ email: value.email });
            if (existEmail) {
                return errorHandle(res, 'Email adress already registered ', 409);
            }

            const client = await Client.create(value);
            const payload = { id: client._id };
            const accessToken = await token.generateAccessToken(payload);
            const refreshToken = await token.generateRefreshToken(payload);
            res.cookie('refreshTokenClient', refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 30 * 24 * 60 * 60 * 1000
            })

            return successHandle(res, {
                data: client,
                token: accessToken
            }, 201);
        } catch (error) {
            return errorHandle(res, error);
        }
    }

    async clientSignIn(req, res) {
        try {
            const { value, error } = clientSignInValidator(req.body);
            if (error) {
                return (res, error, 422);
            }

            const client = await Client.findOne({ email: value.email });
            if (!client) {
                return errorHandle(res, 'Email or password is incorrect', 400);
            }

            const isMatchPassword = await crypto.decrypt(value.password, client.hashedPassword);
            if (!isMatchPassword) {
                return errorHandle(res, 'Email or password is incorrect', 400);
            }

            const otp = generateOTP();
            const email = client.email;
            const mailOptions = {
                from: config.MAIL_USER,
                to: email,
                subject: 'Florify',
                text: otp
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return errorHandle(res, 'Error on sending to email address', 400);
                }
                console.log(info);
            })

            cache.set(email, otp, 120);
            return successHandle(res, {
                message: 'OTP sent successfully'
            })
        } catch (error) {
            return errorHandle(res, error);
        }
    }

    async confirmClientSignIn(req, res) {
        try {
            const { value, error } = confirmClientSignInValidator(req.body);
            if (error) {
                return (res, error, 422);
            }
            
            const client = await Client.findOne({ email: value.email });
            if (!client) {
                return errorHandle(res, 'Client not found', 409);
            }

            const cacheOTP = cache.get(value.email);
            if (!cacheOTP || cacheOTP != value.otp) {
                return (res, 'OTP expired', 400);
            }

            const payload = { id: client._id};
            const accessToken = await token.generateAccessToken(payload);
            const refreshToken = await token.generateRefreshToken(payload);
            res.cookie('refreshTokenClient', refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 30 * 24 * 60 * 60 * 1000
            })

            return successHandle(res, {
                data: client,
                token: accessToken
            })
        } catch (error) {
            return errorHandle(res, error);
        }
    }

    async newAccessToken(req, res) {
        try {
            const refreshToken = req.cookies?.refreshTokenClient;
            if (!refreshToken) {
                return errorHandle(res, 'Refresh token expired', 400)
            }

            const decodedToken = await token.verifyToken(refreshToken, config.REFRESH_TOKEN_KEY);
            if (!decodedToken) {
                return errorHandle(res, 'Invalid token', 400);
            }

            const client = await Client.findById(decodedToken.id);
            if (!client) {
                return errorHandle(res, 'Client not found', 404);
            }

            const payload = { id: client._id };
            const accessToken = await token.generateAccessToken(payload);
            return successHandle(res, {
                token: accessToken
            });
        } catch (error) {
            return errorHandle(res, error);
        }
    }

    async logout(req, res) {
        try {
            const refreshToken = req.cookies?.refreshTokenClient;
            if (!refreshToken) {
                return errorHandle(res, 'Refresh token expired', 400)
            }

            const decodedToken = await token.verifyToken(refreshToken, config.REFRESH_TOKEN_KEY);
            if (!decodedToken) {
                return errorHandle(res, 'Invalid token', 400);
            }

            const client = await Client.findById(decodedToken.id);
            if (!client) {
                return errorHandle(res, 'Client not found', 404);
            }

            res.clearCookie('refreshTokenClient');
            return successHandle(res, {});
        } catch (error) {
            return errorHandle(res, error);
        }
    }
}