/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utilities/catchasync';
import AppError from '../error/appError';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { TUserRole } from '../modules/user/user.interface';
import { User } from '../modules/user/user.model';
import { USER_ROLE } from '../modules/user/user.constant';
import Store from '../modules/store/store.model';

// make costume interface

const auth = (...requiredRoles: TUserRole[]) => {
    return catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            // check if the token is sent from client -----
            let token = req?.headers?.authorization;
            if (!token) {
                throw new AppError(
                    httpStatus.UNAUTHORIZED,
                    'Your are not authorized 1'
                );
            }
            if (token.startsWith('Bearer ')) {
                token = token.slice(7);
            }
            let decoded;

            try {
                decoded = jwt.verify(
                    token,
                    config.jwt_access_secret as string
                ) as JwtPayload;
            } catch (err) {
                throw new AppError(httpStatus.UNAUTHORIZED, 'Token is expired');
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, role, iat } = decoded;
            if (!decoded) {
                throw new AppError(httpStatus.UNAUTHORIZED, 'Token is expired');
            }
            // get the user if that here ---------
            const user = await User.findById(id);
            if (!user) {
                throw new AppError(
                    httpStatus.NOT_FOUND,
                    'This user does not exist'
                );
            }
            if (user.isDeleted) {
                throw new AppError(
                    httpStatus.FORBIDDEN,
                    'This user is already deleted'
                );
            }
            if (user.isBlocked) {
                throw new AppError(
                    httpStatus.FORBIDDEN,
                    'Your account is blocked by admin , please contact with admin'
                );
            }
            if (!user?.isVerified) {
                throw new AppError(
                    httpStatus.BAD_REQUEST,
                    'You are not verified user'
                );
            }

            if (user.role == USER_ROLE.storeOwner) {
                const store = await Store.findOne({ user: id });
                if (!store) {
                    throw new AppError(httpStatus.NOT_FOUND, 'Store not found');
                }
                const currentDate = new Date();
                if (
                    currentDate > store?.trialEndDate &&
                    !store.subscriptionExpiryDate
                ) {
                    throw new AppError(
                        httpStatus.BAD_REQUEST,
                        'Your trial is expired'
                    );
                }
                if (store.subscriptionExpiryDate) {
                    if (currentDate > store.subscriptionExpiryDate) {
                        throw new AppError(
                            httpStatus.BAD_REQUEST,
                            'Your subscription is expired please renew your subscription'
                        );
                    }
                }
            }

            if (user?.passwordChangedAt && iat) {
                const passwordChangeTime =
                    new Date(user?.passwordChangedAt).getTime() / 1000;
                if (passwordChangeTime > iat + 1) {
                    throw new AppError(
                        httpStatus.FORBIDDEN,
                        'You are not authorized 2'
                    );
                }
            }
            if (requiredRoles && !requiredRoles.includes(role)) {
                throw new AppError(
                    httpStatus.UNAUTHORIZED,
                    'Your are not authorized 3'
                );
            }
            // add those properties in req
            req.user = decoded as JwtPayload;
            next();
        }
    );
};

export default auth;
