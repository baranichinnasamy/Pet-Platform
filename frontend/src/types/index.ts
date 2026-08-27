export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  profileImage?: string | null;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  roles: string[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  age?: string | null;
  color?: string | null;
  weight?: number | null;
  description?: string | null;
  healthStatus?: string | null;
  profileImage?: string | null;
  status: string;
  vaccinationStatus?: string | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activePets: number;
  activeAuctions: number;
  completedAuctions: number;
  totalOrders: number;
  totalBookings: number;
  pendingListings: number;
  pendingProviders: number;
  revenue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
