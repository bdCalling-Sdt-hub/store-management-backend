import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import storeValidations from './store.validation';
import storeController from './store.controller';
import { uploadFile } from '../../helper/fileUploader';

const router = express.Router();

router.patch(
    '/update-store',
    auth(USER_ROLE.storeOwner),
    uploadFile(),
    (req, res, next) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(storeValidations.updateStoreData),
    storeController.updateStoreProfile
);
router.get(
    '/all-store',
    auth(USER_ROLE.superAdmin),
    storeController.getAllStore
);
router.get(
    '/single-store/:id',
    auth(USER_ROLE.superAdmin),
    storeController.getSingleStore
);

export const storeRoutes = router;
