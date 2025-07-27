import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MaintenanceHistory from '../MaintenanceHistory';
import { MaintenanceRecord } from '../../../utils/maintenanceApi';

// Mock window.confirm
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
});

describe('MaintenanceHistory', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  const sampleMaintenanceRecords: MaintenanceRecord[] = [
    {
      id: 'maintenance-1',
      bikeId: 'bike-123',
      serviceDate: '2025-01-15',
      serviceDescription: 'Regular cleaning and lubrication',
      cost: 50.00,
      createdAt: '2025-01-15T10:00:00.000Z',
      updatedAt: '2025-01-15T10:00:00.000Z',
    },
    {
      id: 'maintenance-2',
      bikeId: 'bike-123',
      serviceDate: '2025-01-10',
      serviceDescription: 'Brake adjustment',
      cost: 25.00,
      createdAt: '2025-01-10T14:30:00.000Z',
      updatedAt: '2025-01-10T14:30:00.000Z',
    },
    {
      id: 'maintenance-3',
      bikeId: 'bike-123',
      serviceDate: '2025-01-05',
      serviceDescription: 'Chain replacement',
      createdAt: '2025-01-05T09:15:00.000Z',
      updatedAt: '2025-01-05T09:15:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirm.mockClear();
  });

  it('renders empty state when no records', () => {
    render(
      <MaintenanceHistory
        maintenanceRecords={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Nenhuma manutenção registrada')).toBeInTheDocument();
    expect(screen.getByText('Registre manutenções para acompanhar o histórico da sua bicicleta.')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(
      <MaintenanceHistory
        maintenanceRecords={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={true}
      />
    );

    // Should show skeleton loading states
    const loadingElements = screen.getAllByTestId ? screen.queryAllByTestId('loading') : document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('renders maintenance records correctly', () => {
    render(
      <MaintenanceHistory
        maintenanceRecords={sampleMaintenanceRecords}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check that all maintenance records are displayed
    expect(screen.getByText('Regular cleaning and lubrication')).toBeInTheDocument();
    expect(screen.getByText('Brake adjustment')).toBeInTheDocument();
    expect(screen.getByText('Chain replacement')).toBeInTheDocument();

    // Check dates are formatted correctly (Brazilian format)
    expect(screen.getByText('15/01/2025')).toBeInTheDocument();
    expect(screen.getByText('10/01/2025')).toBeInTheDocument();
    expect(screen.getByText('05/01/2025')).toBeInTheDocument();

    // Check costs are displayed correctly
    expect(screen.getByText('R$ 50,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 25,00')).toBeInTheDocument();
  });

  it('displays total cost summary', () => {
    render(
      <MaintenanceHistory
        maintenanceRecords={sampleMaintenanceRecords}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Total gasto em manutenções:')).toBeInTheDocument();
    expect(screen.getByText('R$ 75,00')).toBeInTheDocument(); // 50 + 25
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <MaintenanceHistory
        maintenanceRecords={sampleMaintenanceRecords}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButtons = screen.getAllByTitle('Editar manutenção');
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(sampleMaintenanceRecords[0]);
  });

  it('calls onDelete when delete is confirmed', async () => {
    mockConfirm.mockReturnValue(true);

    render(
      <MaintenanceHistory
        maintenanceRecords={sampleMaintenanceRecords}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByTitle('Excluir manutenção');
    fireEvent.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalledWith('Tem certeza que deseja excluir este registro de manutenção?');
    
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('maintenance-1');
    });
  });

  it('does not call onDelete when delete is cancelled', () => {
    mockConfirm.mockReturnValue(false);

    render(
      <MaintenanceHistory
        maintenanceRecords={sampleMaintenanceRecords}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByTitle('Excluir manutenção');
    fireEvent.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('shows updated date when different from created date', () => {
    const recordsWithUpdate: MaintenanceRecord[] = [
      {
        id: 'maintenance-1',
        bikeId: 'bike-123',
        serviceDate: '2025-01-15',
        serviceDescription: 'Updated maintenance record',
        cost: 50.00,
        createdAt: '2025-01-15T10:00:00.000Z',
        updatedAt: '2025-01-16T14:00:00.000Z', // Different update time
      },
    ];

    render(
      <MaintenanceHistory
        maintenanceRecords={recordsWithUpdate}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/Registrado em: 15\/01\/2025/)).toBeInTheDocument();
    expect(screen.getByText(/Atualizado em: 16\/01\/2025/)).toBeInTheDocument();
  });

  it('does not show total cost summary when no records have cost', () => {
    const recordsWithoutCost: MaintenanceRecord[] = [
      {
        id: 'maintenance-1',
        bikeId: 'bike-123',
        serviceDate: '2025-01-15',
        serviceDescription: 'Free maintenance',
        createdAt: '2025-01-15T10:00:00.000Z',
        updatedAt: '2025-01-15T10:00:00.000Z',
      },
    ];

    render(
      <MaintenanceHistory
        maintenanceRecords={recordsWithoutCost}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText('Total gasto em manutenções:')).not.toBeInTheDocument();
  });

  it('disables delete button while deleting', async () => {
    mockConfirm.mockReturnValue(true);
    mockOnDelete.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <MaintenanceHistory
        maintenanceRecords={sampleMaintenanceRecords}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByTitle('Excluir manutenção');
    fireEvent.click(deleteButtons[0]);

    // Button should be disabled while deletion is in progress
    await waitFor(() => {
      expect(deleteButtons[0]).toBeDisabled();
    });
  });

  it('shows mechanic information correctly', () => {
    render(
      <MaintenanceHistory
        maintenanceRecords={sampleMaintenanceRecords}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Since we don't have mechanic name in the current implementation,
    // it should show "Não informado"
    const mechanicInfo = screen.getAllByText(/Mecânico: Não informado/);
    expect(mechanicInfo.length).toBe(sampleMaintenanceRecords.length);
  });
});