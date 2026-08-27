import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../utils/helpers';
import { updateUserStatusSchema } from '../validators/schemas';
import { ROLES } from '../config';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', validateBody(updateUserStatusSchema), adminController.updateUserStatus);
router.get('/listings/pending', adminController.getPendingListings);
router.post('/listings/:id/approve', adminController.approveListing);

export default router;
