'use client';

import { useState } from 'react';
import { Calendar, DollarSign, Edit, Trash2, User, Wrench } from 'lucide-react';
import { MaintenanceRecord } from '../../utils/maintenanceApi';
import ConfirmDialog from '../ui/ConfirmDialog';

interface MaintenanceHistoryProps {
  maintenanceRecords: MaintenanceRecord[];
  onEdit: (record: MaintenanceRecord) => void;
  onDelete: (recordId: string) => void;
  isLoading?: boolean;
}

export default function MaintenanceHistory({
  maintenanceRecords,
  onEdit,
  onDelete,
  isLoading = false
}: MaintenanceHistoryProps) {
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

  const handleDeleteClick = (record: MaintenanceRecord) => {
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

  const formatDate = (dateString: string) => {
    // Check if it's a date-only string (YYYY-MM-DD) or full datetime
    if (dateString.includes('T')) {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } else {
      // For date-only strings, treat as local date
      return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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

  if (maintenanceRecords.length === 0) {
    return (
      <div className="text-center py-12">
        <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma manutenção registrada
        </h3>
        <p className="text-gray-600">
          Registre manutenções para acompanhar o histórico da sua bicicleta.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {maintenanceRecords.map((record) => (
        <div key={record.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(record.serviceDate)}
              </div>
              <h4 className="font-medium text-gray-900 mb-2">
                {record.serviceDescription}
              </h4>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onEdit(record)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Editar manutenção"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(record)}
                disabled={deletingId === record.id}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Excluir manutenção"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <User className="h-4 w-4 mr-1" />
              <span>Mecânico: {record.mechanicName || 'Não informado'}</span>
            </div>
            
            {record.cost && (
              <div className="flex items-center text-gray-600">
                <DollarSign className="h-4 w-4 mr-1" />
                <span className="font-medium text-green-600">
                  {formatCurrency(Number(record.cost))}
                </span>
              </div>
            )}
          </div>

          {/* Additional info footer */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Registrado em: {formatDate(record.createdAt)}
              {record.updatedAt !== record.createdAt && (
                <span> • Atualizado em: {formatDate(record.updatedAt)}</span>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Total cost summary */}
      {maintenanceRecords.some(record => record.cost) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              Total gasto em manutenções:
            </span>
            <span className="text-lg font-bold text-blue-900">
              {formatCurrency(
                maintenanceRecords
                  .filter(record => record.cost)
                  .reduce((total, record) => total + (Number(record.cost) || 0), 0)
              )}
            </span>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Manutenção"
        message={`Tem certeza que deseja excluir a manutenção "${confirmDialog.recordDescription}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deletingId === confirmDialog.recordId}
      />
    </div>
  );
}