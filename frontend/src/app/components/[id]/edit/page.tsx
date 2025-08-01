'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import { bikeAPI } from '../../../../utils/bikeApi';
import { ComponentFormData, Component } from '../../../../types';
import { Settings, ArrowLeft, Save, Trash2 } from 'lucide-react';

export default function EditComponentPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [component, setComponent] = useState<Component | null>(null);
  const [formData, setFormData] = useState<ComponentFormData>({
    name: '',
    description: '',
    installationDate: '',
    observation: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingComponent, setLoadingComponent] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const componentId = params.id as string;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/Auth/login');
    }
  }, [isAuthenticated, router]);

  // Load component data
  useEffect(() => {
    if (isAuthenticated && componentId) {
      loadComponent();
    }
  }, [isAuthenticated, componentId]);

  const loadComponent = async () => {
    try {
      const response = await bikeAPI.getComponentById(componentId);
      if (response.success) {
        const comp = response.data as Component;
        setComponent(comp);
        setFormData({
          name: comp.name,
          description: comp.description || '',
          installationDate: comp.installationDate ? 
            new Date(comp.installationDate).toISOString().split('T')[0] : '',
          observation: comp.observation || ''
        });
      } else {
        setError('Componente não encontrado');
      }
    } catch (err: any) {
      console.error('Error loading component:', err);
      setError('Erro ao carregar dados do componente');
    } finally {
      setLoadingComponent(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        installationDate: formData.installationDate || undefined,
        observation: formData.observation?.trim() || undefined
      };

      console.log('🔧 Atualizando dados do componente:', submitData);
      const response = await bikeAPI.updateComponent(componentId, submitData);
      
      if (response.success) {
        router.push(`/bikes/${component?.bikeId}?tab=components`);
      } else {
        setError('Erro ao atualizar componente');
      }
    } catch (err: any) {
      console.error('Error updating component:', err);
      setError('Erro ao atualizar componente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await bikeAPI.deleteComponent(componentId);
      
      if (response.success) {
        router.push(`/bikes/${component?.bikeId}?tab=components`);
      } else {
        setError('Erro ao excluir componente');
      }
    } catch (err: any) {
      console.error('Error deleting component:', err);
      setError('Erro ao excluir componente');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loadingComponent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error && !component) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
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
                onClick={() => router.push(`/bikes/${component?.bikeId}`)}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Editar Componente</h1>
                  <p className="text-sm text-gray-600">
                    {component?.name} - {component?.bike?.name}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Informações do Componente
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Atualize as informações do componente.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Nome */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome do Componente *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2.5 rounded-md border-orange-200 bg-orange-50 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500 focus:bg-white transition-colors text-sm"
                placeholder="Ex: Freio Dianteiro, Corrente, Pedal"
              />
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2.5 rounded-md border-orange-200 bg-orange-50 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500 focus:bg-white transition-colors text-sm resize-vertical"
                placeholder="Descreva o componente, marca, modelo, especificações..."
              />
            </div>

            {/* Data de Instalação */}
            <div>
              <label htmlFor="installationDate" className="block text-sm font-medium text-gray-700">
                Data de Instalação
              </label>
              <input
                type="date"
                id="installationDate"
                name="installationDate"
                value={formData.installationDate}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2.5 rounded-md border-orange-200 bg-orange-50 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500 focus:bg-white transition-colors text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Data em que o componente foi instalado na bicicleta
              </p>
            </div>

            {/* Observações */}
            <div>
              <label htmlFor="observation" className="block text-sm font-medium text-gray-700">
                Observações
              </label>
              <textarea
                id="observation"
                name="observation"
                rows={2}
                value={formData.observation}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2.5 rounded-md border-orange-200 bg-orange-50 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-orange-500 focus:bg-white transition-colors text-sm resize-vertical"
                placeholder="Observações especiais, condições de uso, garantia..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push(`/bikes/${component?.bikeId}`)}
                className="px-4 py-2 border border-orange-200 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4">
                  Excluir Componente
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Tem certeza que deseja excluir o componente "{component?.name}"? 
                    Esta ação não pode ser desfeita.
                  </p>
                </div>
                <div className="flex justify-center space-x-3 mt-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}