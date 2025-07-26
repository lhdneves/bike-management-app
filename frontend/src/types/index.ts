// User types
export interface User {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export enum UserRole {
  BIKE_OWNER = 'BIKE_OWNER',
  MECHANIC = 'MECHANIC',
  ADMIN = 'ADMIN',
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Bike types
export interface Bike {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  manufacturer?: string;
  type: BikeType;
  tractionType: TractionType;
  createdAt: string;
  updatedAt: string;
  components?: Component[];
  maintenanceRecords?: MaintenanceRecord[];
  _count?: {
    components: number;
    maintenanceRecords: number;
  };
}

export enum BikeType {
  SPEED = 'SPEED',
  MOUNTAIN_BIKE = 'MOUNTAIN_BIKE',
  ELECTRIC = 'ELECTRIC',
  URBAN = 'URBAN',
}

export enum TractionType {
  MANUAL = 'MANUAL',
  ASSISTED = 'ASSISTED',
}

// Component types
export interface Component {
  id: string;
  bikeId: string;
  name: string;
  description?: string;
  installationDate?: string;
  observation?: string;
  createdAt: string;
  updatedAt: string;
  bike?: {
    id: string;
    name: string;
    type: BikeType;
  };
}

// Maintenance types
export interface MaintenanceRecord {
  id: string;
  bike_id: string;
  mechanic_id?: string;
  service_date: string;
  service_description: string;
  cost?: number;
  created_at: string;
  updated_at: string;
  mechanic?: Mechanic;
}

export interface ScheduledMaintenance {
  id: string;
  bike_id: string;
  scheduled_date: string;
  service_description: string;
  notification_days_before?: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Mechanic types
export interface Mechanic {
  id: string;
  user_id: string;
  address: string;
  phone: string;
  opening_hours?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
  user: User;
}

// Banner types
export interface Banner {
  id: string;
  image_url: string;
  target_url?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface BikeFormData {
  name: string;
  description?: string;
  manufacturer?: string;
  type: BikeType;
  tractionType: TractionType;
}

export interface ComponentFormData {
  name: string;
  description?: string;
  installationDate?: string;
  observation?: string;
}

export interface MaintenanceFormData {
  mechanic_id?: string;
  service_date: string;
  service_description: string;
  cost?: number;
}

export interface ScheduledMaintenanceFormData {
  scheduled_date: string;
  service_description: string;
  notification_days_before?: number;
}