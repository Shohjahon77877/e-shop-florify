import Salesman from '../models/salesman.model.js';
import { 
    createSalesmanValidator,
    salesmanSignInValidator,
    confirmSalesmanSignInValidator,
    updateSalesmanValidator
} from '../validations/salesman.validation.js';
import { errorHandle } from '../helpers/error-handle.js';
import { successHandle } from '../helpers/success-handle.js';
import { Crypto } from '../utils/encrypt-decrypt.js';
import { Token } from '../utils/token-service.js';
import { transporter } from '../helpers/send-to-mail.js';
import { generateOTP } from '../helpers/otp-service.js';
import { isValidObjectId, Types } from 'mongoose';
import NodeCache from 'node-cache';
import config from '../config/configs.js';

const crypto = new Crypto();
const token = new Token();
const cache = new NodeCache();

export class SalesmanController {
    async createSalesman(req, res) {
        try {
            const { value, error } = createSalesmanValidator(req.body);
            if (error) {
                return errorHandle(res, error, 422)
            }

            const existsUsername = await Salesman.findOne({ username: value.username });
            if (existsUsername) {
                return errorHandle(res, 'Username already exists', 409);
            }

            const hashedPassword = await crypto.encrypt(value.password);
            const salesman = await Salesman.create({
                hashedPassword,
                ...value
            });
            return successHandle(res, salesman, 201)
        } catch (error) {
            return errorHandle(res, error)
        }
    }

    async getSalesmans(req, res) {
        try {
            const salesmans = await Salesman.aggregate([
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: 'salesmanID',
                        as: 'products'
                    }
                }
            ]);
            return successHandle(res, salesmans);
        } catch (error) {
            return errorHandle(res, error)
        }
    }

    async getSalesmanById(req, res) {
        try {
            const id = req.params.id;
            if (!isValidObjectId(id)) {
                return errorHandle(res, 'Invalid id', 400);
            }

            const salesman = await Salesman.aggregate([
                {
                    $match: { _id: new Types.ObjectId(String(id)) }
                }, {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: 'salesmanID',
                        as: 'products'
                    }
                }

            ])
            return successHandle(res, salesman);
        } catch (error) {
            return errorHandle(res, error);
        }
    }

    async updateSalesman(req, res) {
        try {
            const id = req.params.id;
            const salesman = await SalesmanController.findSalesmanById(res, id);
            if (!salesman) {
                return errorHandle(res, 'Error on finding salesman', 400);
            }

            const { value, error } = updateSalesmanValidator(req.body);
            if (error) {
                return errorHandle(res, error, 422);
            }

            const updatedSalesman = await Salesman.findByIdAndUpdate(id, value, { new: true });
            return successHandle(res, updatedSalesman);
        } catch (error) {
            return errorHandle(res, error)
        }
    }

    async deleteSalesman(req, res) {
        try {
            const id = req.params.id;
            await SalesmanController.findSalesmanById(res, id);
            await Salesman.findByIdAndDelete(id);
            return successHandle(res, {
                message: 'Salesman successfully deleted'
            })
        } catch (error) {
            return errorHandle(res, error)
        }
    }

    static async findSalesmanById(res, id) {
        try {
            if (!isValidObjectId(id)) {
                return errorHandle(res, 'Invalid id', 400);
            }

            const salesman = await Salesman.findById(id);
            if (!salesman) {
                return errorHandle(res, 'Salesman not found', 404);
            }
            return salesman;
        } catch (error) {
            return errorHandle(res, error)
        }
    }
}

export class SalesmanAuthController {
    async salesmanSignIn(req, res) {
        try {
            const { value, error } = salesmanSignInValidator(req.body);
            if (error) {
                return (res, error, 422);
            }

            const salesman = await Salesman.findOne({ email: value.email });
            if (!salesman) {
                return errorHandle(res, 'Email or password is incorrect', 400);
            }

            const isMatchPassword = await crypto.decrypt(value.password, salesman.hashedPassword);
            if (!isMatchPassword) {
                return errorHandle(res, 'Email or password is incorrect', 400);
            }

            const otp = generateOTP();
            const email = salesman.email;
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

    async confirmSalesmanSignIn(req, res) {
        try {
            const { value, error } = confirmSalesmanSignInValidator(req.body);
            if (error) {
                return (res, error, 422);
            }
            
            const salesman = await Salesman.findOne({ email: value.email });
            if (!salesman) {
                return errorHandle(res, 'Salesman not found', 409);
            }

            const cacheOTP = cache.get(value.email);
            if (!cacheOTP || cacheOTP != value.otp) {
                return (res, 'OTP expired', 400);
            }

            const payload = { id: salesman._id};
            const accessToken = await token.generateAccessToken(payload);
            const refreshToken = await token.generateRefreshToken(payload);
            res.cookie('refreshTokenSalesman', refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 30 * 24 * 60 * 60 * 1000
            })

            return successHandle(res, {
                data: salesman,
                token: accessToken
            })
        } catch (error) {
            return errorHandle(res, error);
        }
    }

    async newAccessToken(req, res) {
        try {
            const refreshToken = req.cookies?.refreshTokenSalesman;
            if (!refreshToken) {
                return errorHandle(res, 'Refresh token expired', 400)
            }

            const decodedToken = await token.verifyToken(refreshToken, config.REFRESH_TOKEN_KEY);
            if (!decodedToken) {
                return errorHandle(res, 'Invalid token', 400);
            }

            const salesman = await Salesman.findById(decodedToken.id);
            if (!salesman) {
                return errorHandle(res, 'Salesman not found', 404);
            }

            const payload = { id: salesman._id };
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
            const refreshToken = req.cookies?.refreshTokenSalesman;
            if (!refreshToken) {
                return errorHandle(res, 'Refresh token expired', 400)
            }

            const decodedToken = await token.verifyToken(refreshToken, config.REFRESH_TOKEN_KEY);
            if (!decodedToken) {
                return errorHandle(res, 'Invalid token', 400);
            }

            const salesman = await Salesman.findById(decodedToken.id);
            if (!salesman) {
                return errorHandle(res, 'Salesman not found', 404);
            }

            res.clearCookie('refreshTokenSalesman');
            return successHandle(res, {});
        } catch (error) {
            return errorHandle(res, error);
        }
    }
}