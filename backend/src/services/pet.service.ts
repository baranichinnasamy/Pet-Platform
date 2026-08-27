import prisma from '../config/database';
import { AppError } from '../utils/helpers';
import { VaccinationStatus } from '@prisma/client';

function calculateAge(dateOfBirth: Date | null): string | null {
  if (!dateOfBirth) return null;
  const now = new Date();
  const diffMs = now.getTime() - dateOfBirth.getTime();
  const years = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
  const months = Math.floor((diffMs % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
  if (years > 0) return `${years}y ${months}m`;
  return `${months} months`;
}

function formatPet(pet: {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed: string | null;
  gender: string | null;
  dateOfBirth: Date | null;
  color: string | null;
  weight: number | null;
  description: string | null;
  healthStatus: string | null;
  profileImage: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  vaccinations?: { status: VaccinationStatus }[];
  images?: { imageUrl: string }[];
}) {
  const vaccinationSummary = pet.vaccinations?.length
    ? pet.vaccinations.some((v) => v.status === 'OVERDUE')
      ? 'OVERDUE'
      : pet.vaccinations.some((v) => v.status === 'DUE_SOON')
        ? 'DUE_SOON'
        : 'UP_TO_DATE'
    : null;

  return {
    ...pet,
    age: calculateAge(pet.dateOfBirth),
    vaccinationStatus: vaccinationSummary,
    images: pet.images?.map((i) => i.imageUrl) ?? [],
  };
}

export async function createPet(
  ownerId: string,
  data: {
    name: string;
    species: string;
    breed?: string;
    gender?: string;
    dateOfBirth?: string;
    color?: string;
    weight?: number;
    description?: string;
    healthStatus?: string;
    profileImage?: string;
  }
) {
  const pet = await prisma.pet.create({
    data: {
      ownerId,
      name: data.name,
      species: data.species,
      breed: data.breed,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      color: data.color,
      weight: data.weight,
      description: data.description,
      healthStatus: data.healthStatus,
      profileImage: data.profileImage,
      ownerships: {
        create: {
          userId: ownerId,
          ownershipType: 'PRIMARY',
        },
      },
    },
    include: { vaccinations: true, images: true },
  });

  return formatPet(pet);
}

export async function getPets(filters: {
  ownerId?: string;
  species?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = {
    ...(filters.ownerId && { ownerId: filters.ownerId }),
    ...(filters.species && { species: { contains: filters.species, mode: 'insensitive' as const } }),
    ...(filters.status && { status: filters.status as 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'DECEASED' }),
  };

  const [pets, total] = await Promise.all([
    prisma.pet.findMany({
      where,
      include: { vaccinations: true, images: true },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.pet.count({ where }),
  ]);

  return {
    pets: pets.map(formatPet),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPetById(id: string) {
  const pet = await prisma.pet.findUnique({
    where: { id },
    include: {
      vaccinations: true,
      images: true,
      ownerships: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!pet) {
    throw new AppError(404, 'Pet not found');
  }

  return formatPet(pet);
}

export async function updatePet(
  id: string,
  ownerId: string,
  data: Partial<{
    name: string;
    species: string;
    breed: string;
    gender: string;
    dateOfBirth: string;
    color: string;
    weight: number;
    description: string;
    healthStatus: string;
    profileImage: string;
    status: string;
  }>
) {
  const pet = await prisma.pet.findUnique({ where: { id } });
  if (!pet) throw new AppError(404, 'Pet not found');
  if (pet.ownerId !== ownerId) throw new AppError(403, 'Not authorized to update this pet');

  const updated = await prisma.pet.update({
    where: { id },
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      status: data.status as 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'DECEASED' | undefined,
    },
    include: { vaccinations: true, images: true },
  });

  return formatPet(updated);
}

export async function deletePet(id: string, ownerId: string) {
  const pet = await prisma.pet.findUnique({ where: { id } });
  if (!pet) throw new AppError(404, 'Pet not found');
  if (pet.ownerId !== ownerId) throw new AppError(403, 'Not authorized to delete this pet');

  await prisma.pet.delete({ where: { id } });
}
