import { Request, Response } from 'express';
import * as adminService from '../services/admin.service';
import { asyncHandler, sendSuccess } from '../utils/helpers';

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();
  sendSuccess(res, stats);
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
  const result = await adminService.getUsers(page, limit);
  sendSuccess(res, result);
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.updateUserStatus(
    req.user!.userId,
    req.params.id,
    req.body.status
  );
  sendSuccess(res, user);
});

export const getPendingListings = asyncHandler(async (_req: Request, res: Response) => {
  const listings = await adminService.getPendingListings();
  sendSuccess(res, listings);
});

export const approveListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await adminService.approveListing(req.user!.userId, req.params.id);
  sendSuccess(res, listing);
});
