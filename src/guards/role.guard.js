import { errorHandle } from "../helpers/error-handle.js";

export const RolesGuard = (includesRoles = []) => {
    return (req, res, next) => {
        if (!includesRoles.includes(req.user?.role)) {
            return errorHandle(res, 'Forbidden user', 403);
        }
        next();
    }
}