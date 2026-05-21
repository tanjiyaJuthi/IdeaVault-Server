import { jwtVerify } from 'jose-cjs';
import {JWKS} from './joseCjs.js';

export const verifyToken = async (req, res, next) => {
    try {
        // console.log(req.headers);
        const authHeader = req?.headers.authorization;
        // console.log(authHeader);
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: 'Unauthorized access!!'
                });
        }

        const token = authHeader.split(" ")[1];
        console.log(token);
            if (!token) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        message: 'Unauthorized access!!'
                    });
            }

        const { payload } = await jwtVerify(token, JWKS, {
            issuer: process.env.BETTER_AUTH_URL,
            audience: process.env.BETTER_AUTH_URL,
        });
        // console.log(payload);

        req.user = payload;

        next();
    } catch (error) {
        return res
            .status(500)
            .json({
                success: false,
                message: 'Authentication Failed!'
            });
    }
}