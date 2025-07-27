import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MaintenanceModal from '../MaintenanceModal';
import { maintenanceAPI } from '../../../utils/maintenanceApi';

// Mock the maintenance API
jest.mock('../../../utils/maintenanceApi', () => ({
  maintenanceAPI: {
    createMaintenanceRecord: jest.fn(),
    updateMaintenanceRecord: jest.fn(),
  },
}));

const mockMaintenanceAPI = maintenanceAPI as jest.Mocked<typeof maintenanceAPI>;

describe('MaintenanceModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    bikeId: 'bike-123',
    bikeName: 'Test Bike',
    editingRecord: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(<MaintenanceModal {...defaultProps} />);
    
    expect(screen.getByText('Nova Manutenção')).toBeInTheDocument();
    expect(screen.getByText('Bicicleta: Test Bike')).toBeInTheDocument();
    expect(screen.getByLabelText(/Data da Manutenção/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mecânico/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição do Serviço/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Valor \(opcional\)/)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<MaintenanceModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Nova Manutenção')).not.toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    render(<MaintenanceModal {...defaultProps} />);
    
    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Data da manutenção é obrigatória')).toBeInTheDocument();
      expect(screen.getByText('Nome do mecânico é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Descrição do serviço é obrigatória')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    mockMaintenanceAPI.createMaintenanceRecord.mockResolvedValue({
      success: true,
      data: { id: 'maintenance-123' },
    });

    render(<MaintenanceModal {...defaultProps} />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/Data da Manutenção/), {
      target: { value: '2025-01-15' },
    });
    fireEvent.change(screen.getByLabelText(/Mecânico/), {
      target: { value: 'John Mechanic' },
    });
    fireEvent.change(screen.getByLabelText(/Descrição do Serviço/), {
      target: { value: 'Regular maintenance' },
    });
    fireEvent.change(screen.getByLabelText(/Valor \(opcional\)/), {
      target: { value: '50.00' },
    });

    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMaintenanceAPI.createMaintenanceRecord).toHaveBeenCalledWith(
        'bike-123',
        {
          service_date: '2025-01-15',
          mechanic_name: 'John Mechanic',
          service_description: 'Regular maintenance',
          cost: 50,
        }
      );
      expect(defaultProps.onSuccess).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('handles API errors', async () => {
    mockMaintenanceAPI.createMaintenanceRecord.mockResolvedValue({
      success: false,
      message: 'API Error',
    });

    render(<MaintenanceModal {...defaultProps} />);
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/Data da Manutenção/), {
      target: { value: '2025-01-15' },
    });
    fireEvent.change(screen.getByLabelText(/Mecânico/), {
      target: { value: 'John Mechanic' },
    });
    fireEvent.change(screen.getByLabelText(/Descrição do Serviço/), {
      target: { value: 'Regular maintenance' },
    });

    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('populates form when editing a record', () => {
    const editingRecord = {
      id: 'maintenance-123',
      bikeId: 'bike-123',
      serviceDate: '2025-01-15T00:00:00.000Z',
      serviceDescription: 'Existing maintenance',
      cost: 75.50,
      createdAt: '2025-01-15T00:00:00.000Z',
      updatedAt: '2025-01-15T00:00:00.000Z',
    };

    render(<MaintenanceModal {...defaultProps} editingRecord={editingRecord} />);
    
    expect(screen.getByText('Editar Manutenção')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-01-15')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing maintenance')).toBeInTheDocument();
    expect(screen.getByDisplayValue('75.5')).toBeInTheDocument();
  });

  it('updates existing record when editing', async () => {
    mockMaintenanceAPI.updateMaintenanceRecord.mockResolvedValue({
      success: true,
      data: { id: 'maintenance-123' },
    });

    const editingRecord = {
      id: 'maintenance-123',
      bikeId: 'bike-123',
      serviceDate: '2025-01-15T00:00:00.000Z',
      serviceDescription: 'Existing maintenance',
      cost: 75.50,
      createdAt: '2025-01-15T00:00:00.000Z',
      updatedAt: '2025-01-15T00:00:00.000Z',
    };

    render(<MaintenanceModal {...defaultProps} editingRecord={editingRecord} />);
    
    // Update description
    fireEvent.change(screen.getByLabelText(/Descrição do Serviço/), {
      target: { value: 'Updated maintenance' },
    });

    // Add mechanic name (required field)
    fireEvent.change(screen.getByLabelText(/Mecânico/), {
      target: { value: 'John Mechanic' },
    });

    const submitButton = screen.getByText('Atualizar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMaintenanceAPI.updateMaintenanceRecord).toHaveBeenCalledWith(
        'maintenance-123',
        expect.objectContaining({
          service_description: 'Updated maintenance',
          mechanic_name: 'John Mechanic',
        })
      );
    });
  });

  it('closes modal when cancel button is clicked', () => {
    render(<MaintenanceModal {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('closes modal when X button is clicked', () => {
    render(<MaintenanceModal {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: '' }); // X button has no text
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('validates cost field must be numeric', async () => {
    render(<MaintenanceModal {...defaultProps} />);
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/Data da Manutenção/), {
      target: { value: '2025-01-15' },
    });
    fireEvent.change(screen.getByLabelText(/Mecânico/), {
      target: { value: 'John Mechanic' },
    });
    fireEvent.change(screen.getByLabelText(/Descrição do Serviço/), {
      target: { value: 'Regular maintenance' },
    });
    fireEvent.change(screen.getByLabelText(/Valor \(opcional\)/), {
      target: { value: 'invalid-number' },
    });

    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Valor deve ser um número válido')).toBeInTheDocument();
    });
  });
});