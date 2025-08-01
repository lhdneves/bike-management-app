'use client';

import { useState } from 'react';
import { Calendar, Edit, Trash2, Bell, Clock, AlertCircle } from 'lucide-react';
import { ScheduledMaintenance } from '../../utils/maintenanceApi';
import ConfirmDialog from '../ui/ConfirmDialog';

interface ScheduledMaintenanceListProps {
  scheduledMaintenance: ScheduledMaintenance[];
  onEdit: (record: ScheduledMaintenance) => void;
  onDelete: (recordId: string) => void;
  isLoading?: boolean;
}

export default function ScheduledMaintenanceList({
  scheduledMaintenance,
  onEdit,
  onDelete,
  isLoading = false
}: ScheduledMaintenanceListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    recordId: string;
    recordDescription: string;
  }>({
    isOpen: false,
    recordId: '',
    recordDescription: ''
  });

  const handleDeleteClick = (record: ScheduledMaintenance) => {
    setConfirmDialog({
      isOpen: true,
      recordId: record.id,
      recordDescription: record.serviceDescription
    });
  };

  const handleConfirmDelete = async () => {
    const { recordId } = confirmDialog;
    setDeletingId(recordId);
    
    try {
      await onDelete(recordId);
      setConfirmDialog({ isOpen: false, recordId: '', recordDescription: '' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, recordId: '', recordDescription: '' });
  };

  // Helper function to safely parse dates
  const parseDate = (dateString: string) => {
    if (!dateString) return new Date();
    
    // Extract just the date part if it's a datetime string
    let datePart = dateString;
    if (dateString.includes('T')) {
      datePart = dateString.split('T')[0];
    }
    
    // Parse as local date to avoid timezone issues
    const parts = datePart.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Month is 0-indexed
      const day = parseInt(parts[2]);
      return new Date(year, month, day);
    }
    
    // Fallback
    return new Date(dateString);
  };

  const formatDate = (dateString: string) => {
    const date = parseDate(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const isUpcoming = (dateString: string) => {
    const scheduledDate = parseDate(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return scheduledDate >= today;
  };

  const getDaysUntil = (dateString: string) => {
    const scheduledDate = parseDate(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = scheduledDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (dateString: string) => {
    const daysUntil = getDaysUntil(dateString);
    if (daysUntil < 0) return 'text-red-600 bg-red-50 border-red-200';
    if (daysUntil <= 7) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (daysUntil <= 30) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const getUrgencyText = (dateString: string) => {
    const daysUntil = getDaysUntil(dateString);
    if (daysUntil < 0) return `${Math.abs(daysUntil)} dias atrás`;
    if (daysUntil === 0) return 'Hoje';
    if (daysUntil === 1) return 'Amanhã';
    return `Em ${daysUntil} dias`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (scheduledMaintenance.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma manutenção agendada
        </h3>
        <p className="text-gray-600">
          Agende manutenções para planejar o cuidado da sua bicicleta.
        </p>
      </div>
    );
  }

  // Separate overdue and upcoming
  const overdueMaintenance = scheduledMaintenance.filter(item => !isUpcoming(item.scheduledDate));
  const upcomingMaintenance = scheduledMaintenance.filter(item => isUpcoming(item.scheduledDate));

  return (
    <div className="space-y-6">
      {/* Overdue Section */}
      {overdueMaintenance.length > 0 && (
        <div>
          <div className="flex items-center mb-3">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <h4 className="text-lg font-medium text-red-900">Atrasadas</h4>
          </div>
          <div className="space-y-3">
            {overdueMaintenance.map((record) => (
              <div key={record.id} className={`border rounded-lg p-4 ${getUrgencyColor(record.scheduledDate)}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center text-sm mb-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(record.scheduledDate)}
                      <span className="ml-2 text-xs font-medium">
                        ({getUrgencyText(record.scheduledDate)})
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {record.serviceDescription}
                    </h4>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => onEdit(record)}
                      className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                      title="Editar agendamento"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(record)}
                      disabled={deletingId === record.id}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Excluir agendamento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  {record.notificationDaysBefore && (
                    <div className="flex items-center text-gray-600">
                      <Bell className="h-4 w-4 mr-1" />
                      <span>Lembrete: {record.notificationDaysBefore} dias antes</span>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Criado em: {formatDate(record.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Section */}
      {upcomingMaintenance.length > 0 && (
        <div>
          <div className="flex items-center mb-3">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Próximas</h4>
          </div>
          <div className="space-y-3">
            {upcomingMaintenance.map((record) => (
              <div key={record.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getUrgencyColor(record.scheduledDate)}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center text-sm mb-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(record.scheduledDate)}
                      <span className="ml-2 text-xs font-medium">
                        ({getUrgencyText(record.scheduledDate)})
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {record.serviceDescription}
                    </h4>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => onEdit(record)}
                      className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                      title="Editar agendamento"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(record)}
                      disabled={deletingId === record.id}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Excluir agendamento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  {record.notificationDaysBefore && (
                    <div className="flex items-center text-gray-600">
                      <Bell className="h-4 w-4 mr-1" />
                      <span>Lembrete: {record.notificationDaysBefore} dias antes</span>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Criado em: {formatDate(record.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Agendamento"
        message={`Tem certeza que deseja excluir o agendamento "${confirmDialog.recordDescription}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deletingId === confirmDialog.recordId}
      />
    </div>
  );
}