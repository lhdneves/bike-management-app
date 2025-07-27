import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScheduledMaintenanceModal from '../ScheduledMaintenanceModal';
import { maintenanceAPI } from '../../../utils/maintenanceApi';

// Mock the maintenance API
jest.mock('../../../utils/maintenanceApi', () => ({
  maintenanceAPI: {
    createScheduledMaintenance: jest.fn(),
    updateScheduledMaintenance: jest.fn(),
  }
}));

const mockMaintenanceAPI = maintenanceAPI as jest.Mocked<typeof maintenanceAPI>;

describe('ScheduledMaintenanceModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    bikeId: 'test-bike-id',
    bikeName: 'Test Bike',
    editingRecord: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when open', () => {
    render(<ScheduledMaintenanceModal {...defaultProps} />);
    
    expect(screen.getByText('Agendar Manutenção')).toBeInTheDocument();
    expect(screen.getByText('Test Bike')).toBeInTheDocument();
    expect(screen.getByLabelText(/Data Agendada/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição do Serviço/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lembrete/)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ScheduledMaintenanceModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Agendar Manutenção')).not.toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<ScheduledMaintenanceModal {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /agendar/i });
    await user.click(submitButton);
    
    expect(screen.getByText('Data agendada é obrigatória')).toBeInTheDocument();
    expect(screen.getByText('Descrição do serviço é obrigatória')).toBeInTheDocument();
  });

  it('should validate future date requirement', async () => {
    const user = userEvent.setup();
    render(<ScheduledMaintenanceModal {...defaultProps} />);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateInput = screen.getByLabelText(/Data Agendada/);
    
    await user.type(dateInput, yesterday.toISOString().split('T')[0]);
    await user.type(screen.getByLabelText(/Descrição do Serviço/), 'Test service');
    
    const submitButton = screen.getByRole('button', { name: /agendar/i });
    await user.click(submitButton);
    
    expect(screen.getByText('Data agendada deve ser no futuro')).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const mockResponse = { success: true, data: { id: 'new-id' } };
    mockMaintenanceAPI.createScheduledMaintenance.mockResolvedValue(mockResponse);
    
    render(<ScheduledMaintenanceModal {...defaultProps} />);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    await user.type(screen.getByLabelText(/Data Agendada/), tomorrow.toISOString().split('T')[0]);
    await user.type(screen.getByLabelText(/Descrição do Serviço/), 'Test scheduled maintenance');
    await user.selectOptions(screen.getByLabelText(/Lembrete/), '7');
    
    const submitButton = screen.getByRole('button', { name: /agendar/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockMaintenanceAPI.createScheduledMaintenance).toHaveBeenCalledWith('test-bike-id', {
        scheduled_date: tomorrow.toISOString().split('T')[0],
        service_description: 'Test scheduled maintenance',
        notification_days_before: 7
      });
    });
    
    expect(defaultProps.onSuccess).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    const user = userEvent.setup();
    const mockResponse = { 
      success: false, 
      message: 'API Error',
      errors: [{ path: 'scheduled_date', msg: 'Invalid date' }]
    };
    mockMaintenanceAPI.createScheduledMaintenance.mockResolvedValue(mockResponse);
    
    render(<ScheduledMaintenanceModal {...defaultProps} />);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    await user.type(screen.getByLabelText(/Data Agendada/), tomorrow.toISOString().split('T')[0]);
    await user.type(screen.getByLabelText(/Descrição do Serviço/), 'Test scheduled maintenance');
    
    const submitButton = screen.getByRole('button', { name: /agendar/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid date')).toBeInTheDocument();
    });
  });

  it('should populate form when editing', () => {
    const editingRecord = {
      id: 'edit-id',
      bikeId: 'test-bike-id',
      scheduledDate: '2024-12-31T00:00:00.000Z',
      serviceDescription: 'Edit test service',
      notificationDaysBefore: 3,
      isCompleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };
    
    render(<ScheduledMaintenanceModal {...defaultProps} editingRecord={editingRecord} />);
    
    expect(screen.getByText('Editar Agendamento')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Edit test service')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
  });

  it('should call update API when editing', async () => {
    const user = userEvent.setup();
    const editingRecord = {
      id: 'edit-id',
      bikeId: 'test-bike-id',
      scheduledDate: '2024-12-31T00:00:00.000Z',
      serviceDescription: 'Edit test service',
      notificationDaysBefore: 3,
      isCompleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };
    
    const mockResponse = { success: true, data: editingRecord };
    mockMaintenanceAPI.updateScheduledMaintenance.mockResolvedValue(mockResponse);
    
    render(<ScheduledMaintenanceModal {...defaultProps} editingRecord={editingRecord} />);
    
    const submitButton = screen.getByRole('button', { name: /atualizar/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockMaintenanceAPI.updateScheduledMaintenance).toHaveBeenCalledWith('edit-id', {
        scheduled_date: '2024-12-31',
        service_description: 'Edit test service',
        notification_days_before: 3
      });
    });
  });

  it('should close modal when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<ScheduledMaintenanceModal {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should close modal when X button is clicked', async () => {
    const user = userEvent.setup();
    render(<ScheduledMaintenanceModal {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: '' }); // X button has no accessible name
    await user.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});