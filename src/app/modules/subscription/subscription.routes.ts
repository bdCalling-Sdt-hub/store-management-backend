import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import SubscriptionController from './subscription.controller';

const router = express.Router();
router.post(
    '/purchase-subscription',
    auth(USER_ROLE.storeOwner),
    SubscriptionController.purchaseSubscription
);
router.post(
    '/continue-with-trial',
    auth(USER_ROLE.storeOwner),
    SubscriptionController.continueWithTrail
);

export const subscriptionRoutes = router;
