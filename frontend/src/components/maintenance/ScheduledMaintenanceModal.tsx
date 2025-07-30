'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Wrench, Bell, AlertCircle } from 'lucide-react';
import { maintenanceAPI, CreateScheduledMaintenanceData, UpdateScheduledMaintenanceData, ScheduledMaintenance } from '../../utils/maintenanceApi';

interface ScheduledMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bikeId: string;
  bikeName: string;
  editingRecord?: ScheduledMaintenance | null;
}

export default function ScheduledMaintenanceModal({
  isOpen,
  onClose,
  onSuccess,
  bikeId,
  bikeName,
  editingRecord = null
}: ScheduledMaintenanceModalProps) {
  const [formData, setFormData] = useState({
    scheduled_date: '',
    service_description: '',
    notification_days_before: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or editing record changes
  useEffect(() => {
    if (isOpen) {
      if (editingRecord) {
        setFormData({
          scheduled_date: editingRecord.scheduledDate.split('T')[0], // Convert to YYYY-MM-DD format
          service_description: editingRecord.serviceDescription,
          notification_days_before: editingRecord.notificationDaysBefore ? editingRecord.notificationDaysBefore.toString() : ''
        });
      } else {
        setFormData({
          scheduled_date: '',
          service_description: '',
          notification_days_before: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, editingRecord]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Helper function to safely parse dates
  const parseDate = (dateString: string) => {
    if (!dateString) return new Date();
    
    // If it's already a datetime string, use it directly
    if (dateString.includes('T')) {
      return new Date(dateString);
    }
    
    // If it's just a date (YYYY-MM-DD), treat it as local date
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    
    // Fallback
    return new Date(dateString);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.scheduled_date) {
      newErrors.scheduled_date = 'Data agendada é obrigatória';
    } else {
      const selectedDate = parseDate(formData.scheduled_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        newErrors.scheduled_date = 'Data agendada deve ser no futuro';
      }
    }

    if (!formData.service_description.trim()) {
      newErrors.service_description = 'Descrição do serviço é obrigatória';
    }

    if (formData.notification_days_before && (isNaN(Number(formData.notification_days_before)) || Number(formData.notification_days_before) < 0)) {
      newErrors.notification_days_before = 'Dias de notificação deve ser um número positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const requestData: CreateScheduledMaintenanceData | UpdateScheduledMaintenanceData = {
        scheduled_date: formData.scheduled_date,
        service_description: formData.service_description,
        notification_days_before: formData.notification_days_before ? Number(formData.notification_days_before) : undefined
      };

      let response;
      if (editingRecord) {
        response = await maintenanceAPI.updateScheduledMaintenance(editingRecord.id, requestData);
      } else {
        response = await maintenanceAPI.createScheduledMaintenance(bikeId, requestData);
      }

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        if (response.errors && Array.isArray(response.errors)) {
          const fieldErrors: { [key: string]: string } = {};
          response.errors.forEach((error: any) => {
            if (error.path) {
              fieldErrors[error.path] = error.msg;
            }
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: response.message || 'Erro ao agendar manutenção' });
        }
      }
    } catch (error) {
      console.error('Error submitting scheduled maintenance:', error);
      setErrors({ general: 'Erro inesperado ao agendar manutenção' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const notificationOptions = [
    { value: '', label: 'Sem notificação' },
    { value: '1', label: '1 dia antes' },
    { value: '3', label: '3 dias antes' },
    { value: '7', label: '1 semana antes' },
    { value: '14', label: '2 semanas antes' },
    { value: '30', label: '1 mês antes' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editingRecord ? 'Editar Agendamento' : 'Agendar Manutenção'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Bike Info */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Bicicleta:</strong> {bikeName}
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Scheduled Date */}
            <div>
              <label htmlFor="scheduled_date" className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data Agendada *
              </label>
              <input
                type="date"
                id="scheduled_date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.scheduled_date ? 'border-red-300' : 'border-blue-200'
                }`}
              />
              {errors.scheduled_date && (
                <p className="mt-1 text-sm text-red-600">{errors.scheduled_date}</p>
              )}
            </div>

            {/* Service Description */}
            <div>
              <label htmlFor="service_description" className="block text-sm font-medium text-gray-700 mb-1">
                <Wrench className="h-4 w-4 inline mr-1" />
                Descrição do Serviço *
              </label>
              <textarea
                id="service_description"
                name="service_description"
                value={formData.service_description}
                onChange={handleChange}
                rows={3}
                placeholder="Descreva o serviço a ser realizado..."
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.service_description ? 'border-red-300' : 'border-blue-200'
                }`}
              />
              {errors.service_description && (
                <p className="mt-1 text-sm text-red-600">{errors.service_description}</p>
              )}
            </div>

            {/* Notification Days Before */}
            <div>
              <label htmlFor="notification_days_before" className="block text-sm font-medium text-gray-700 mb-1">
                <Bell className="h-4 w-4 inline mr-1" />
                Lembrete (opcional)
              </label>
              <select
                id="notification_days_before"
                name="notification_days_before"
                value={formData.notification_days_before}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.notification_days_before ? 'border-red-300' : 'border-blue-200'
                }`}
              >
                {notificationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.notification_days_before && (
                <p className="mt-1 text-sm text-red-600">{errors.notification_days_before}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-blue-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : (editingRecord ? 'Atualizar' : 'Agendar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}