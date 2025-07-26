'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { bikeAPI } from '../../../utils/bikeApi';
import { Bike as BikeInterface, Component } from '../../../types';
import { 
  Bike, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Settings, 
  Plus, 
  Calendar,
  Wrench,
  User,
  Zap,
  Mountain
} from 'lucide-react';

export default function BikeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [bike, setBike] = useState<BikeInterface | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [activeTab, setActiveTab] = useState('components');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const bikeId = params.id as string;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/Auth/login');
    }
  }, [isAuthenticated, router]);

  // Load bike data
  useEffect(() => {
    if (isAuthenticated && bikeId) {
      loadBikeData();
    }
  }, [isAuthenticated, bikeId]);

  const loadBikeData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [bikeResponse, componentsResponse] = await Promise.all([
        bikeAPI.getBikeById(bikeId),
        bikeAPI.getBikeComponents(bikeId)
      ]);

      if (bikeResponse.success) {
        setBike(bikeResponse.data as BikeInterface);
      } else {
        setError('Bicicleta não encontrada');
      }

      if (componentsResponse.success) {
        setComponents(componentsResponse.data as Component[]);
      }
    } catch (err: any) {
      console.error('Error loading bike data:', err);
      setError('Erro ao carregar dados da bicicleta');
    } finally {
      setIsLoading(false);
    }
  };

  const getBikeIcon = (type: string) => {
    switch (type) {
      case 'ELECTRIC':
        return <Zap className="h-6 w-6" />;
      case 'MOUNTAIN_BIKE':
        return <Mountain className="h-6 w-6" />;
      default:
        return <Bike className="h-6 w-6" />;
    }
  };

  const getBikeTypeLabel = (type: string) => {
    switch (type) {
      case 'SPEED':
        return 'Speed';
      case 'MOUNTAIN_BIKE':
        return 'Mountain Bike';
      case 'ELECTRIC':
        return 'Elétrica';
      case 'URBAN':
        return 'Urbana';
      default:
        return type;
    }
  };

  const getTractionLabel = (traction: string) => {
    return traction === 'ASSISTED' ? 'Assistida' : 'Manual';
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados da bicicleta...</p>
        </div>
      </div>
    );
  }

  if (error || !bike) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bike className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error || 'Bicicleta não encontrada'}
          </h3>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  {getBikeIcon(bike.type)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{bike.name}</h1>
                  <p className="text-sm text-gray-600">
                    {getBikeTypeLabel(bike.type)} • {getTractionLabel(bike.tractionType)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push(`/bikes/${bike.id}/edit`)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bike Info Card */}
        <div className="bg-white shadow rounded-lg mb-8 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Fabricante</h3>
              <p className="mt-1 text-sm text-gray-900">{bike.manufacturer || 'Não informado'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Tipo de Tração</h3>
              <p className="mt-1 text-sm text-gray-900">{getTractionLabel(bike.tractionType)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Data de Cadastro</h3>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(bike.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          
          {bike.description && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
              <p className="mt-1 text-sm text-gray-900">{bike.description}</p>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { id: 'components', name: 'Componentes', icon: Settings },
                { id: 'maintenance', name: 'Manutenções', icon: Wrench },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'components' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Componentes da Bicicleta
                  </h3>
                  <button 
                    onClick={() => router.push(`/bikes/${bikeId}/components/new`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Componente
                  </button>
                </div>

                {components.length === 0 ? (
                  <div className="text-center py-12">
                    <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum componente cadastrado
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Adicione componentes para acompanhar manutenções específicas.
                    </p>
                    <button 
                      onClick={() => router.push(`/bikes/${bikeId}/components/new`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Componente
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {components.map((component) => (
                      <div key={component.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{component.name}</h4>
                          <button 
                            onClick={() => router.push(`/components/${component.id}/edit`)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                        {component.description && (
                          <p className="text-sm text-gray-600 mb-2">{component.description}</p>
                        )}
                        {component.installationDate && (
                          <p className="text-xs text-gray-500">
                            Instalado em: {new Date(component.installationDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'maintenance' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Histórico de Manutenções
                  </h3>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Manutenção
                  </button>
                </div>

                <div className="text-center py-12">
                  <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma manutenção registrada
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Registre manutenções para acompanhar o histórico da sua bicicleta.
                  </p>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Primeira Manutenção
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}