import Admin from '../models/admin.model.js';
import { errorHandle } from '../helpers/error-handle.js';
import { successHandle } from '../helpers/success-handle.js';
import { Crypto } from '../utils/encrypt-decrypt.js';
import { Token } from '../utils/token-service.js';
import {
    createAdminValidator,
    signInAdminValidator,
    confirmAdminSignInValidator,
    updateAdminValidator
} from '../validations/admin.validation.js';
import { generateOTP } from '../helpers/otp-service.js';
import config from '../config/configs.js';
import { transporter } from '../helpers/send-to-mail.js';
import NodeCache from 'node-cache';
import { isValidObjectId } from 'mongoose';

const crypto = new Crypto();
const token = new Token();
const cache = new NodeCache();

export class AdminController {
    async createAdmin(req, res) {
        try {
            const { value, error } = createAdminValidator(req.body);
            if (error) {
                return errorHandle(res, error, 422)
            }

            const existsUsername = await Admin.findOne({ username: value.username });
            if (existsUsername) {
                return errorHandle(res, 'Username already exists', 409);
            }

            const hashedPassword = await crypto.encrypt(value.password);
            const admin = await Admin.create({
                username: value.username,
                hashedPassword,
                ...value
            });
            return successHandle(res, admin, 201)
        } catch (error) {
            return errorHandle(res, error)
        }
    }

    async getAllAdmins(req, res) {
        try {
            const admins = await Admin.find();
            return successHandle(res, admins);
        } catch (error) {
            return errorHandle(res, error)
        }
    }

    async getAdminById(req, res) {
        try {
            const id = req.params.id;
            const admin = await AdminController.findAdminById(res, id);
            return successHandle(res, admin);
        } catch (error) {
            return errorHandle(res, error);
        }
    }

    async updateAdmin(req, res) {
        try {
            const id = req.params.id;
            const admin = await AdminController.findAdminById(res, id);
            const { value, error } = updateAdminValidator(req.body);
            if (error) {
                return errorHandle(res, error, 422)
            }

            let hashedPassword = admin.hashedPassword;
            if (value.password) {
                hashedPassword = await crypto.encrypt(value.password);
            }

            const updateAdmin = await Admin.findByIdAndUpdate(id, {
                ...value,
                hashedPassword
            }, { new: true });

            return successHandle(res, updateAdmin);
        } catch (error) {
            return errorHandle(res, error);
        }
    }
    
    async deleteAdmin(req, res) {
        try {
            const id = req.params.id;
            await AdminController.findAdminById(res, id);
            await Admin.findByIdAndDelete(id)
            return successHandle(res, { message: 'Admin successfully deleted' });
        } catch (error) {
            return errorHandle(res, error);
        }
    }

    static async findAdminById(res, id) {
        try {
            if (!isValidObjectId(id)) {
                return errorHandle(res, 'Invalid id', 400)
            }
            
            const admin = await Admin.findById(id)
            if (!admin) {
                return errorHandle(res, 'Admin not found', 404)
            }

            return admin;
        } catch (error) {
            return errorHandle(res, error);
        }
    }
}

export class AdminAuthController {
    async adminSignIn(req, res) {
        try {
            const { value, error } = signInAdminValidator(req.body);
            if (error) {
                return (res, error, 422);
            }

            const admin = await Admin.findOne({ email: value.email });
            if (!admin) {
                return errorHandle(res, 'Email or password is incorrect', 400);
            }

            const isMatchPassword = await crypto.decrypt(value.password, admin.hashedPassword);
            if (!isMatchPassword) {
                return errorHandle(res, 'Email or password is incorrect', 400);
            }

            const otp = generateOTP();
            const email = admin.email;
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

    async confirmAdminSignIn(req, res) {
        try {
            const { value, error } = confirmAdminSignInValidator(req.body);
            if (error) {
                return (res, error, 422);
            }
            
            const admin = await Admin.findOne({ email: value.email });
            if (!admin) {
                return errorHandle(res, 'Admin not found', 409);
            }

            const cacheOTP = cache.get(value.email);
            if (!cacheOTP || cacheOTP != value.otp) {
                return (res, 'OTP expired', 400);
            }

            const payload = { id: admin._id, role: admin.role };
            const accessToken = await token.generateAccessToken(payload);
            const refreshToken = await token.generateRefreshToken(payload);
            res.cookie('refreshTokenAdmin', refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 30 * 24 * 60 * 60 * 1000
            })

            return successHandle(res, {
                data: admin,
                token: accessToken
            })
        } catch (error) {
            return errorHandle(res, error);
        }
    }

    async newAccessToken(req, res) {
        try {
            const refreshToken = req.cookies?.refreshTokenAdmin
            if (!refreshToken) {
                return errorHandle(res, 'Refresh token expired', 400)
            }

            const decodedToken = await token.verifyToken(refreshToken, config.REFRESH_TOKEN_KEY);
            if (!decodedToken) {
                return errorHandle(res, 'Invalid token', 400);
            }

            const admin = await Admin.findById(decodedToken.id);
            if (!admin) {
                return errorHandle(res, 'Admin not found', 404);
            }

            const payload = { id: admin._id };
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
            const refreshToken = req.cookies?.refreshTokenAdmin;
            if (!refreshToken) {
                return errorHandle(res, 'Refresh token expired', 400)
            }

            const decodedToken = await token.verifyToken(refreshToken, config.REFRESH_TOKEN_KEY);
            if (!decodedToken) {
                return errorHandle(res, 'Invalid token', 400);
            }

            const admin = await Admin.findById(decodedToken.id);
            if (!admin) {
                return errorHandle(res, 'Admin not found', 404);
            }

            res.clearCookie('refreshTokenAdmin');
            return successHandle(res, {});
        } catch (error) {
            return errorHandle(res, error);
        }
    }
}