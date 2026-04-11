export interface UserType {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string | null;
  email: string;
  phone: string | null;
  emailVerifiedAt: string | null; // ISO date string
  phoneVerifiedAt: string | null; // ISO date string
  address: string | null;
  city: string | null;
  country: string | null;
  zipcode: string | null;
  fcmToken: string | null;
  provider: "local" | string; // extend if needed
  providerId: string | null;
  status: "active" | "inactive" | "blocked" | string;
  role: "user" | "admin" | string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
