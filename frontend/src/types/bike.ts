export interface Bike {
  id: string;
  name: string;
  description?: string;
  manufacturer?: string;
  type: BikeType;
  tractionType: TractionType;
  createdAt: Date;
  updatedAt: Date;
  components?: Component[];
  maintenanceRecords?: MaintenanceRecord[];
  scheduledMaintenance?: ScheduledMaintenance[];
  _count?: {
    components: number;
    maintenanceRecords: number;
  };
}

export interface Component {
  id: string;
  bikeId: string;
  name: string;
  description?: string;
  installationDate?: Date;
  observation?: string;
  createdAt: Date;
  updatedAt: Date;
  bike?: {
    id: string;
    name: string;
    type: BikeType;
  };
}

export interface MaintenanceRecord {
  id: string;
  bikeId: string;
  serviceDate: Date;
  serviceDescription: string;
  cost?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduledMaintenance {
  id: string;
  bikeId: string;
  scheduledDate: Date;
  serviceDescription: string;
  notificationDaysBefore?: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BikeStats {
  totalBikes: number;
  totalComponents: number;
  totalMaintenanceRecords: number;
  upcomingMaintenance: number;
}

export enum BikeType {
  SPEED = 'SPEED',
  MOUNTAIN_BIKE = 'MOUNTAIN_BIKE',
  ELECTRIC = 'ELECTRIC',
  URBAN = 'URBAN'
}

export enum TractionType {
  MANUAL = 'MANUAL',
  ASSISTED = 'ASSISTED'
}

export interface CreateBikeData {
  name: string;
  description?: string;
  manufacturer?: string;
  type: BikeType;
  tractionType: TractionType;
}

export interface UpdateBikeData {
  name?: string;
  description?: string;
  manufacturer?: string;
  type?: BikeType;
  tractionType?: TractionType;
}

export interface CreateComponentData {
  name: string;
  description?: string;
  installationDate?: Date;
  observation?: string;
}

export interface UpdateComponentData {
  name?: string;
  description?: string;
  installationDate?: Date;
  observation?: string;
}

export interface BikeApiResponse {
  success: boolean;
  message: string;
  data?: Bike | Bike[] | BikeStats;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ComponentApiResponse {
  success: boolean;
  message: string;
  data?: Component | Component[];
  errors?: Array<{
    field: string;
    message: string;
  }>;
}