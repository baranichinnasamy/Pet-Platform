import { Router } from 'express';
import * as petController from '../controllers/pet.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateBody } from '../utils/helpers';
import { createPetSchema, updatePetSchema } from '../validators/schemas';

const router = Router();

router.get('/', optionalAuth, petController.getPets);
router.get('/:id', petController.getPetById);
router.post('/', authenticate, validateBody(createPetSchema), petController.createPet);
router.put('/:id', authenticate, validateBody(updatePetSchema), petController.updatePet);
router.delete('/:id', authenticate, petController.deletePet);

export default router;
