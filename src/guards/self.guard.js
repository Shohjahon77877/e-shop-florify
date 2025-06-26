import { errorHandle } from "../helpers/error-handle.js"

export const SelfGuard = (req, res, next) => {
    if (req.user?.role === 'superadmin' || req.user?.id == req.params?.id) {
        return next();
    } else {
        return errorHandle(res, 'Forbidden user', 403);
    }
}