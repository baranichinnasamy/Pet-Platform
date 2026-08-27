import argon2 from 'argon2';
import prisma from '../config/database';
import { ROLES } from '../config';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt';
import { AppError } from '../utils/helpers';

function formatUser(user: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  roles: { role: { name: string } }[];
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    status: user.status,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    roles: user.roles.map((r) => r.role.name),
  };
}

const userInclude = {
  roles: { include: { role: true } },
};

export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roles?: string[];
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError(409, 'Email already registered');
  }

  const passwordHash = await argon2.hash(data.password);
  const roleNames = data.roles?.length ? data.roles : [ROLES.BUYER, ROLES.OWNER];

  const roles = await prisma.role.findMany({
    where: { name: { in: roleNames } },
  });

  if (roles.length === 0) {
    throw new AppError(500, 'Default roles not configured. Run database seed.');
  }

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      roles: {
        create: roles.map((role) => ({ roleId: role.id })),
      },
      cart: { create: {} },
    },
    include: userInclude,
  });

  const tokens = await issueTokens(user);
  return { user: formatUser(user), ...tokens };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: userInclude,
  });

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (user.status === 'SUSPENDED') {
    throw new AppError(403, 'Account suspended');
  }

  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const tokens = await issueTokens(user);
  return { user: formatUser(user), ...tokens };
}

export async function refresh(refreshToken: string) {
  let payload: { userId: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, 'Invalid refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: { include: userInclude } },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Refresh token expired');
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } });
  const tokens = await issueTokens(stored.user);
  return { user: formatUser(stored.user), ...tokens };
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ...userInclude,
      addresses: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return formatUser(user);
}

export async function updateProfile(
  userId: string,
  data: { name?: string; phone?: string; profileImage?: string }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    include: userInclude,
  });

  return formatUser(user);
}

async function issueTokens(user: { id: string; email: string; roles: { role: { name: string } }[] }) {
  const roles = user.roles.map((r) => r.role.name);
  const accessToken = signAccessToken({ userId: user.id, email: user.email, roles });
  const refreshToken = signRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return { accessToken, refreshToken };
}
