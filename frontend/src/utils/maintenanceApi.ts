const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export interface MaintenanceRecord {
  id: string;
  bikeId: string;
  serviceDate: string;
  serviceDescription: string;
  mechanicName?: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
  bike?: {
    id: string;
    name: string;
  };
}

export interface ScheduledMaintenance {
  id: string;
  bikeId: string;
  scheduledDate: string;
  serviceDescription: string;
  notificationDaysBefore?: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  bike?: {
    id: string;
    name: string;
  };
}

export interface CreateMaintenanceData {
  service_date: string;
  mechanic_name: string;
  service_description: string;
  cost?: number;
}

export interface UpdateMaintenanceData {
  service_date: string;
  mechanic_name: string;
  service_description: string;
  cost?: number;
}

export interface CreateScheduledMaintenanceData {
  scheduled_date: string;
  service_description: string;
  notification_days_before?: number;
}

export interface UpdateScheduledMaintenanceData {
  scheduled_date: string;
  service_description: string;
  notification_days_before?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

class MaintenanceAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
    return headers;
  }

  async getBikeMaintenanceRecords(bikeId: string): Promise<ApiResponse<MaintenanceRecord[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/bikes/${bikeId}/maintenance`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching bike maintenance records:', error);
      return {
        success: false,
        message: 'Erro ao buscar registros de manutenção',
      };
    }
  }

  async createMaintenanceRecord(bikeId: string, maintenanceData: CreateMaintenanceData): Promise<ApiResponse<MaintenanceRecord>> {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/bikes/${bikeId}/maintenance`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(maintenanceData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      return {
        success: false,
        message: 'Erro ao criar registro de manutenção',
      };
    }
  }

  async getMaintenanceRecord(maintenanceId: string): Promise<ApiResponse<MaintenanceRecord>> {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/${maintenanceId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching maintenance record:', error);
      return {
        success: false,
        message: 'Erro ao buscar registro de manutenção',
      };
    }
  }

  async updateMaintenanceRecord(maintenanceId: string, maintenanceData: UpdateMaintenanceData): Promise<ApiResponse<MaintenanceRecord>> {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/${maintenanceId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(maintenanceData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating maintenance record:', error);
      return {
        success: false,
        message: 'Erro ao atualizar registro de manutenção',
      };
    }
  }

  async deleteMaintenanceRecord(maintenanceId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/${maintenanceId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      return {
        success: false,
        message: 'Erro ao excluir registro de manutenção',
      };
    }
  }

  // Scheduled Maintenance Methods
  async getBikeScheduledMaintenance(bikeId: string): Promise<ApiResponse<ScheduledMaintenance[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/bikes/${bikeId}/scheduled-maintenance`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching bike scheduled maintenance:', error);
      return {
        success: false,
        message: 'Erro ao buscar manutenções agendadas',
      };
    }
  }

  async createScheduledMaintenance(bikeId: string, scheduledData: CreateScheduledMaintenanceData): Promise<ApiResponse<ScheduledMaintenance>> {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/bikes/${bikeId}/scheduled-maintenance`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(scheduledData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating scheduled maintenance:', error);
      return {
        success: false,
        message: 'Erro ao agendar manutenção',
      };
    }
  }

  async getScheduledMaintenance(scheduledId: string): Promise<ApiResponse<ScheduledMaintenance>> {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/scheduled-maintenance/${scheduledId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching scheduled maintenance:', error);
      return {
        success: false,
        message: 'Erro ao buscar manutenção agendada',
      };
    }
  }

  async updateScheduledMaintenance(scheduledId: string, scheduledData: UpdateScheduledMaintenanceData): Promise<ApiResponse<ScheduledMaintenance>> {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/scheduled-maintenance/${scheduledId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(scheduledData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating scheduled maintenance:', error);
      return {
        success: false,
        message: 'Erro ao atualizar manutenção agendada',
      };
    }
  }

  async deleteScheduledMaintenance(scheduledId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/scheduled-maintenance/${scheduledId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting scheduled maintenance:', error);
      return {
        success: false,
        message: 'Erro ao excluir manutenção agendada',
      };
    }
  }
}

export const maintenanceAPI = new MaintenanceAPI();