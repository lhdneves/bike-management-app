'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bike, 
  Wrench, 
  Calendar, 
  Settings, 
  Plus, 
  User, 
  LogOut,
  MoreVertical,
  Edit,
  Trash2,
  Zap,
  Mountain
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { bikeAPI } from '../../utils/bikeApi';
import { Bike as BikeTypeInterface, BikeType, TractionType } from '../../types';

interface DashboardStats {
  totalBikes: number;
  totalComponents: number;
  totalMaintenanceRecords: number;
  upcomingMaintenance: number;
}

export default function DashboardNew() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('bikes');
  const [bikes, setBikes] = useState<BikeTypeInterface[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/Auth/login');
    }
  }, [isAuthenticated, router]);

  // Load dashboard data
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const [bikesResponse, statsResponse] = await Promise.all([
        bikeAPI.getBikes(),
        bikeAPI.getBikeStats()
      ]);

      if (bikesResponse.success) {
        setBikes(bikesResponse.data as BikeTypeInterface[]);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data as DashboardStats);
      }
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/Auth/login');
  };

  const getBikeIcon = (type: BikeType) => {
    switch (type) {
      case BikeType.ELECTRIC:
        return <Zap className="h-5 w-5" />;
      case BikeType.MOUNTAIN_BIKE:
        return <Mountain className="h-5 w-5" />;
      default:
        return <Bike className="h-5 w-5" />;
    }
  };

  const getBikeTypeLabel = (type: BikeType) => {
    switch (type) {
      case BikeType.SPEED:
        return 'Speed';
      case BikeType.MOUNTAIN_BIKE:
        return 'Mountain Bike';
      case BikeType.ELECTRIC:
        return 'Elétrica';
      case BikeType.URBAN:
        return 'Urbana';
      default:
        return type;
    }
  };

  const getTractionLabel = (traction: TractionType) => {
    return traction === TractionType.ASSISTED ? 'Assistida' : 'Manual';
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Bike className="h-8 w-8 text-orange-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">BikeManager</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Settings className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-500"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bike className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Minhas Bicicletas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {isLoading ? '...' : stats?.totalBikes || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Settings className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Componentes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {isLoading ? '...' : stats?.totalComponents || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Próximas manutenções
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {isLoading ? '...' : stats?.upcomingMaintenance || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Wrench className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Manutenções
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {isLoading ? '...' : stats?.totalMaintenanceRecords || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bicicletas Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Minhas Bicicletas
                </h3>
                <button 
                  onClick={() => router.push('/bikes/new')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Bicicleta
                </button>
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Carregando bicicletas...</p>
                </div>
              ) : bikes.length === 0 ? (
                <div className="text-center py-12">
                  <Bike className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Nenhuma bicicleta cadastrada
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Cadastre sua primeira bicicleta para começar a gerenciar componentes, 
                    manutenções e acompanhar gastos.
                  </p>
                  <button 
                    onClick={() => router.push('/bikes/new')}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Cadastrar Primeira Bicicleta
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bikes.map((bike) => (
                    <div key={bike.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {getBikeIcon(bike.type)}
                          </div>
                          <div className="ml-3">
                            <h4 className="text-lg font-medium text-gray-900">
                              {bike.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {getBikeTypeLabel(bike.type)}
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {bike.description && (
                        <p className="text-gray-600 mb-3">{bike.description}</p>
                      )}
                      
                      {bike.manufacturer && (
                        <p className="text-sm text-gray-500 mb-3">
                          <strong>Fabricante:</strong> {bike.manufacturer}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>Tração: {getTractionLabel(bike.tractionType)}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Ativa
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-3">
                        <span>{bike._count?.components || 0} componentes</span>
                        <span>{bike._count?.maintenanceRecords || 0} manutenções</span>
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <button 
                          onClick={() => router.push(`/bikes/${bike.id}`)}
                          className="flex-1 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-md hover:bg-orange-100"
                        >
                          Ver Detalhes
                        </button>
                        <button 
                          onClick={() => router.push(`/bikes/${bike.id}/edit`)}
                          className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}