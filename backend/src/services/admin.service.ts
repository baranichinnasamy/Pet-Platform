import prisma from '../config/database';
import { AppError } from '../utils/helpers';

export async function getDashboardStats() {
  const [
    totalUsers,
    activePets,
    activeAuctions,
    completedAuctions,
    totalOrders,
    totalBookings,
    pendingListings,
    pendingProviders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.pet.count({ where: { status: 'ACTIVE' } }),
    prisma.auction.count({ where: { status: 'ACTIVE' } }),
    prisma.auction.count({ where: { status: 'SETTLED' } }),
    prisma.order.count(),
    prisma.booking.count(),
    prisma.petListing.count({ where: { status: 'PENDING_APPROVAL' } }),
    prisma.serviceProvider.count({ where: { verificationStatus: 'PENDING' } }),
  ]);

  const revenueResult = await prisma.order.aggregate({
    where: { paymentStatus: 'PAID' },
    _sum: { totalAmount: true },
  });

  return {
    totalUsers,
    activePets,
    activeAuctions,
    completedAuctions,
    totalOrders,
    totalBookings,
    pendingListings,
    pendingProviders,
    revenue: revenueResult._sum.totalAmount ?? 0,
  };
}

export async function getUsers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        roles: { include: { role: true } },
      },
    }),
    prisma.user.count(),
  ]);

  return {
    users: users.map((u) => ({
      ...u,
      roles: u.roles.map((r) => r.role.name),
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function updateUserStatus(adminId: string, userId: string, status: 'ACTIVE' | 'SUSPENDED') {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  await prisma.adminAction.create({
    data: {
      adminId,
      action: 'UPDATE_USER_STATUS',
      entityType: 'USER',
      entityId: userId,
      description: `Status changed to ${status}`,
    },
  });

  return user;
}

export async function approveListing(adminId: string, listingId: string) {
  const listing = await prisma.petListing.findUnique({
    where: { id: listingId },
    include: { auction: true },
  });

  if (!listing) throw new AppError(404, 'Listing not found');
  if (listing.status !== 'PENDING_APPROVAL') {
    throw new AppError(400, 'Listing is not pending approval');
  }

  const updated = await prisma.petListing.update({
    where: { id: listingId },
    data: { status: 'ACTIVE' },
  });

  if (listing.auction) {
    const now = new Date();
    const auctionStatus =
      listing.auction.startTime <= now && listing.auction.endTime > now ? 'ACTIVE' : 'SCHEDULED';
    await prisma.auction.update({
      where: { id: listing.auction.id },
      data: { status: auctionStatus },
    });
  }

  await prisma.adminAction.create({
    data: {
      adminId,
      action: 'APPROVE_LISTING',
      entityType: 'PET_LISTING',
      entityId: listingId,
    },
  });

  return updated;
}

export async function getPendingListings() {
  return prisma.petListing.findMany({
    where: { status: 'PENDING_APPROVAL' },
    include: {
      pet: true,
      seller: { select: { id: true, name: true, email: true } },
      auction: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function logAdminAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string,
  description?: string
) {
  return prisma.adminAction.create({
    data: { adminId, action, entityType, entityId, description },
  });
}
