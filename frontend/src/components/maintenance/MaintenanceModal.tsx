'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, User, Wrench, DollarSign, AlertCircle } from 'lucide-react';
import { maintenanceAPI, CreateMaintenanceData, UpdateMaintenanceData, MaintenanceRecord } from '../../utils/maintenanceApi';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bikeId: string;
  bikeName: string;
  editingRecord?: MaintenanceRecord | null;
}

export default function MaintenanceModal({
  isOpen,
  onClose,
  onSuccess,
  bikeId,
  bikeName,
  editingRecord = null
}: MaintenanceModalProps) {
  const [formData, setFormData] = useState({
    service_date: '',
    mechanic_name: '',
    service_description: '',
    cost: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or editing record changes
  useEffect(() => {
    if (isOpen) {
      if (editingRecord) {
        setFormData({
          service_date: editingRecord.serviceDate.split('T')[0], // Convert to YYYY-MM-DD format
          mechanic_name: editingRecord.mechanicName || '',
          service_description: editingRecord.serviceDescription,
          cost: editingRecord.cost ? editingRecord.cost.toString() : ''
        });
      } else {
        setFormData({
          service_date: '',
          mechanic_name: '',
          service_description: '',
          cost: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, editingRecord]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.service_date) {
      newErrors.service_date = 'Data da manutenção é obrigatória';
    }

    if (!formData.mechanic_name.trim()) {
      newErrors.mechanic_name = 'Nome do mecânico é obrigatório';
    }

    if (!formData.service_description.trim()) {
      newErrors.service_description = 'Descrição do serviço é obrigatória';
    }

    if (formData.cost && isNaN(Number(formData.cost))) {
      newErrors.cost = 'Valor deve ser um número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const requestData: CreateMaintenanceData | UpdateMaintenanceData = {
        service_date: formData.service_date,
        mechanic_name: formData.mechanic_name,
        service_description: formData.service_description,
        cost: formData.cost ? Number(formData.cost) : undefined
      };

      let response;
      if (editingRecord) {
        response = await maintenanceAPI.updateMaintenanceRecord(editingRecord.id, requestData);
      } else {
        response = await maintenanceAPI.createMaintenanceRecord(bikeId, requestData);
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
          setErrors({ general: response.message || 'Erro ao salvar manutenção' });
        }
      }
    } catch (error) {
      console.error('Error submitting maintenance:', error);
      setErrors({ general: 'Erro inesperado ao salvar manutenção' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editingRecord ? 'Editar Manutenção' : 'Nova Manutenção'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Bike Info */}
          <div className="mb-4 p-3 bg-orange-50 rounded-lg">
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
            {/* Service Date */}
            <div>
              <label htmlFor="service_date" className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data da Manutenção *
              </label>
              <input
                type="date"
                id="service_date"
                name="service_date"
                value={formData.service_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm bg-orange-50 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-colors ${
                  errors.service_date ? 'border-red-300 bg-red-50' : 'border-orange-200'
                }`}
              />
              {errors.service_date && (
                <p className="mt-1 text-sm text-red-600">{errors.service_date}</p>
              )}
            </div>

            {/* Mechanic Name */}
            <div>
              <label htmlFor="mechanic_name" className="block text-sm font-medium text-gray-700 mb-1">
                <User className="h-4 w-4 inline mr-1" />
                Mecânico *
              </label>
              <input
                type="text"
                id="mechanic_name"
                name="mechanic_name"
                value={formData.mechanic_name}
                onChange={handleChange}
                placeholder="Nome do mecânico"
                className={`w-full px-3 py-2 border rounded-md shadow-sm bg-orange-50 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-colors ${
                  errors.mechanic_name ? 'border-red-300 bg-red-50' : 'border-orange-200'
                }`}
              />
              {errors.mechanic_name && (
                <p className="mt-1 text-sm text-red-600">{errors.mechanic_name}</p>
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
                placeholder="Descreva o serviço realizado..."
                className={`w-full px-3 py-2 border rounded-md shadow-sm bg-orange-50 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-colors ${
                  errors.service_description ? 'border-red-300 bg-red-50' : 'border-orange-200'
                }`}
              />
              {errors.service_description && (
                <p className="mt-1 text-sm text-red-600">{errors.service_description}</p>
              )}
            </div>

            {/* Cost */}
            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Valor (opcional)
              </label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-md shadow-sm bg-orange-50 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-colors ${
                  errors.cost ? 'border-red-300 bg-red-50' : 'border-orange-200'
                }`}
              />
              {errors.cost && (
                <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-orange-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : (editingRecord ? 'Atualizar' : 'Salvar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}