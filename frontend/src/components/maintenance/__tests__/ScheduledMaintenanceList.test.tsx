import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScheduledMaintenanceList from '../ScheduledMaintenanceList';
import { ScheduledMaintenance } from '../../../utils/maintenanceApi';

// Mock window.confirm
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm,
});

describe('ScheduledMaintenanceList', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  const mockScheduledMaintenance: ScheduledMaintenance[] = [
    {
      id: '1',
      bikeId: 'bike-1',
      scheduledDate: '2024-12-31T00:00:00.000Z', // Future date
      serviceDescription: 'Future maintenance service',
      notificationDaysBefore: 7,
      isCompleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      bikeId: 'bike-1',
      scheduledDate: '2023-12-01T00:00:00.000Z', // Past date (overdue)
      serviceDescription: 'Overdue maintenance service',
      notificationDaysBefore: 3,
      isCompleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  ];

  const defaultProps = {
    scheduledMaintenance: mockScheduledMaintenance,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    isLoading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  it('should render scheduled maintenance records', () => {
    render(<ScheduledMaintenanceList {...defaultProps} />);
    
    expect(screen.getByText('Future maintenance service')).toBeInTheDocument();
    expect(screen.getByText('Overdue maintenance service')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<ScheduledMaintenanceList {...defaultProps} isLoading={true} />);
    
    expect(screen.getAllByRole('generic').some(el => 
      el.className.includes('animate-pulse')
    )).toBe(true);
  });

  it('should show empty state when no scheduled maintenance', () => {
    render(<ScheduledMaintenanceList {...defaultProps} scheduledMaintenance={[]} />);
    
    expect(screen.getByText('Nenhuma manutenção agendada')).toBeInTheDocument();
    expect(screen.getByText('Agende manutenções para planejar o cuidado da sua bicicleta.')).toBeInTheDocument();
  });

  it('should separate overdue and upcoming maintenance', () => {
    render(<ScheduledMaintenanceList {...defaultProps} />);
    
    expect(screen.getByText('Atrasadas')).toBeInTheDocument();
    expect(screen.getByText('Próximas')).toBeInTheDocument();
  });

  it('should show notification badge when notification_days_before is set', () => {
    render(<ScheduledMaintenanceList {...defaultProps} />);
    
    expect(screen.getByText('Lembrete: 7 dias antes')).toBeInTheDocument();
    expect(screen.getByText('Lembrete: 3 dias antes')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<ScheduledMaintenanceList {...defaultProps} />);
    
    const editButtons = screen.getAllByTitle('Editar agendamento');
    await user.click(editButtons[0]);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockScheduledMaintenance[0]);
  });

  it('should call onDelete when delete is confirmed', async () => {
    const user = userEvent.setup();
    render(<ScheduledMaintenanceList {...defaultProps} />);
    
    const deleteButtons = screen.getAllByTitle('Excluir agendamento');
    await user.click(deleteButtons[0]);
    
    expect(mockConfirm).toHaveBeenCalledWith('Tem certeza que deseja excluir este agendamento de manutenção?');
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should not call onDelete when delete is cancelled', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(false);
    
    render(<ScheduledMaintenanceList {...defaultProps} />);
    
    const deleteButtons = screen.getAllByTitle('Excluir agendamento');
    await user.click(deleteButtons[0]);
    
    expect(mockConfirm).toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('should show correct urgency colors for different dates', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 8);
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 35);

    const testMaintenance: ScheduledMaintenance[] = [
      {
        id: '1',
        bikeId: 'bike-1',
        scheduledDate: tomorrow.toISOString(),
        serviceDescription: 'Tomorrow service',
        isCompleted: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        bikeId: 'bike-1',
        scheduledDate: nextWeek.toISOString(),
        serviceDescription: 'Next week service',
        isCompleted: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '3',
        bikeId: 'bike-1',
        scheduledDate: nextMonth.toISOString(),
        serviceDescription: 'Next month service',
        isCompleted: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ];

    render(<ScheduledMaintenanceList {...defaultProps} scheduledMaintenance={testMaintenance} />);
    
    expect(screen.getByText('Tomorrow service')).toBeInTheDocument();
    expect(screen.getByText('Next week service')).toBeInTheDocument();
    expect(screen.getByText('Next month service')).toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    render(<ScheduledMaintenanceList {...defaultProps} />);
    
    // Check that dates are formatted in Brazilian format
    expect(screen.getByText('31/12/2024')).toBeInTheDocument();
    expect(screen.getByText('01/12/2023')).toBeInTheDocument();
  });

  it('should show relative time information', () => {
    render(<ScheduledMaintenanceList {...defaultProps} />);
    
    // Should show relative time like "Em X dias" or "X dias atrás"
    const timeElements = screen.getAllByText(/dias/);
    expect(timeElements.length).toBeGreaterThan(0);
  });
});