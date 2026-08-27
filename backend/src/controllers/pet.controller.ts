import { Request, Response } from 'express';
import * as petService from '../services/pet.service';
import { asyncHandler, sendSuccess } from '../utils/helpers';

export const createPet = asyncHandler(async (req: Request, res: Response) => {
  const pet = await petService.createPet(req.user!.userId, req.body);
  sendSuccess(res, pet, 201);
});

export const getPets = asyncHandler(async (req: Request, res: Response) => {
  const { species, status, page, limit, ownerId } = req.query;
  const result = await petService.getPets({
    ownerId: (ownerId as string) || (req.query.mine === 'true' ? req.user?.userId : undefined),
    species: species as string,
    status: status as string,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });
  sendSuccess(res, result);
});

export const getPetById = asyncHandler(async (req: Request, res: Response) => {
  const pet = await petService.getPetById(req.params.id);
  sendSuccess(res, pet);
});

export const updatePet = asyncHandler(async (req: Request, res: Response) => {
  const pet = await petService.updatePet(req.params.id, req.user!.userId, req.body);
  sendSuccess(res, pet);
});

export const deletePet = asyncHandler(async (req: Request, res: Response) => {
  await petService.deletePet(req.params.id, req.user!.userId);
  sendSuccess(res, { message: 'Pet deleted successfully' });
});
