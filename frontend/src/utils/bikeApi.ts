import api from './api';
import { Bike, BikeFormData, Component, ComponentFormData, ApiResponse } from '../types';

export const bikeAPI = {
  // Bike operations
  getBikes: async (): Promise<ApiResponse<Bike[]>> => {
    const response = await api.get('/bikes');
    return response.data;
  },

  getBikeById: async (id: string): Promise<ApiResponse<Bike>> => {
    const response = await api.get(`/bikes/${id}`);
    return response.data;
  },

  createBike: async (data: BikeFormData): Promise<ApiResponse<Bike>> => {
    const response = await api.post('/bikes', data);
    return response.data;
  },

  updateBike: async (id: string, data: Partial<BikeFormData>): Promise<ApiResponse<Bike>> => {
    const response = await api.put(`/bikes/${id}`, data);
    return response.data;
  },

  deleteBike: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/bikes/${id}`);
    return response.data;
  },

  getBikeStats: async (): Promise<ApiResponse<{
    totalBikes: number;
    totalComponents: number;
    totalMaintenanceRecords: number;
    upcomingMaintenance: number;
  }>> => {
    const response = await api.get('/bikes/stats');
    return response.data;
  },

  // Component operations
  getBikeComponents: async (bikeId: string): Promise<ApiResponse<Component[]>> => {
    const response = await api.get(`/bikes/${bikeId}/components`);
    return response.data;
  },

  createComponent: async (bikeId: string, data: ComponentFormData): Promise<ApiResponse<Component>> => {
    const response = await api.post(`/bikes/${bikeId}/components`, data);
    return response.data;
  },

  getComponentById: async (id: string): Promise<ApiResponse<Component>> => {
    const response = await api.get(`/components/${id}`);
    return response.data;
  },

  updateComponent: async (id: string, data: Partial<ComponentFormData>): Promise<ApiResponse<Component>> => {
    const response = await api.put(`/components/${id}`, data);
    return response.data;
  },

  deleteComponent: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/components/${id}`);
    return response.data;
  }
};